import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from '../../email/email.service';
import { NotificationTask } from '../../types/notification.types';

const REMINDER_PATTERNS: { regex: RegExp; ms: (n: number) => number }[] = [
  {
    regex: /^(\d+)\s*(minute|minutes|min|mins)\s*before$/i,
    ms: (n) => n * 60_000,
  },
  {
    regex: /^(\d+)\s*(hour|hours|hr|hrs)\s*before$/i,
    ms: (n) => n * 3_600_000,
  },
  { regex: /^(\d+)\s*(day|days)\s*before$/i, ms: (n) => n * 86_400_000 },
];

function parseReminderTime(value: string): number {
  for (const { regex, ms } of REMINDER_PATTERNS) {
    const match = regex.exec(value.trim());
    if (match) return ms(Number(match[1]));
  }
  return 3_600_000; // default: 1 hour before
}

function parseDigestTime(value: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value.trim());
  if (!match) return 8 * 60; // default: 8:00 AM
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  if (!meridiem && hours === 24) hours = 0;
  return hours * 60 + minutes;
}

function zonedParts(date: Date, timeZone: string): Record<string, string> {
  const parts: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }
  return parts;
}

function safeTimeZone(timeZone: string): string {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone });
    return timeZone;
  } catch {
    return 'UTC';
  }
}

function zonedMinutesOfDay(date: Date, timeZone: string): number {
  const parts = zonedParts(date, safeTimeZone(timeZone));
  return (Number(parts.hour) % 24) * 60 + Number(parts.minute);
}

function formatRelativeTime(ms: number): string {
  const totalMinutes = Math.max(1, Math.round(ms / 60_000));
  if (totalMinutes < 60)
    return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours < 24) {
    if (mins === 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
    return `${hours} hour${hours === 1 ? '' : 's'} and ${mins} minute${mins === 1 ? '' : 's'}`;
  }
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}

function formatDueDate(date: Date, timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: timeZone ? safeTimeZone(timeZone) : undefined,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndSendNotifications() {
    try {
      await this.sendDueReminders();
      await this.sendOverdueAlerts();
      await this.sendDailyDigests();
    } catch (error) {
      this.logger.error('Notification check failed', (error as Error).stack);
    }
  }

  async sendDueReminders() {
    const now = new Date();

    const tasks = await this.prisma.task.findMany({
      where: {
        status: { not: 'completed' },
        notifiedDue: false,
        dueDate: { gt: now },
      },
      include: { User: { include: { settings: true, preferences: true } } },
    });

    for (const task of tasks as NotificationTask[]) {
      const settings = task.User.settings;
      if (settings && !settings.dueReminders) continue;
      if ((settings?.highPriorityOnly ?? false) && task.priority !== 'high')
        continue;

      const offsetMs = parseReminderTime(
        settings?.reminderTime ?? '1 hour before',
      );
      const dueIn = (task.dueDate as Date).getTime() - now.getTime();
      if (dueIn > offsetMs) continue;

      await this.createNotification({
        userId: task.User.id,
        type: 'due',
        taskId: task.id,
        title: `Task Reminder: "${task.title}" is due soon`,
        message: `Your task "${task.title}" is due in ${formatRelativeTime(dueIn)}. Due: ${formatDueDate(task.dueDate as Date, task.User.preferences?.timezone)}.`,
      });

      if (settings?.emailNotifications) {
        await this.sendTaskNotification(task.User.email, task, 'due');
      }
      await this.prisma.task.update({
        where: { id: task.id },
        data: { notifiedDue: true },
      });
    }
  }

  async sendOverdueAlerts() {
    const now = new Date();

    const tasks = await this.prisma.task.findMany({
      where: {
        status: { not: 'completed' },
        notifiedOverdue: false,
        dueDate: { lt: now },
      },
      include: { User: { include: { settings: true, preferences: true } } },
    });

    for (const task of tasks as NotificationTask[]) {
      const settings = task.User.settings;
      if (settings && !settings.overdueAlerts) continue;

      await this.createNotification({
        userId: task.User.id,
        type: 'overdue',
        taskId: task.id,
        title: `Overdue: "${task.title}"`,
        message: `"${task.title}" was due on ${formatDueDate(task.dueDate as Date, task.User.preferences?.timezone)} and is now overdue.`,
      });

      if (settings?.emailNotifications) {
        await this.sendTaskNotification(task.User.email, task, 'overdue');
      }
      await this.prisma.task.update({
        where: { id: task.id },
        data: { notifiedOverdue: true },
      });
    }
  }

  async sendDailyDigests() {
    const users = await this.prisma.user.findMany({
      where: { settings: { is: { dailyDigest: true } } },
      include: { settings: true, preferences: true },
    });

    const now = new Date();
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    for (const user of users) {
      if (!user.settings) continue;
      const timeZone = user.preferences?.timezone || 'UTC';

      const target = parseDigestTime(user.settings.digestTime);
      const minutesOfDay = zonedMinutesOfDay(now, timeZone);
      if (minutesOfDay < target || minutesOfDay >= target + 10) continue;

      const todayKey = now.toISOString().slice(0, 10);
      if (
        user.settings.lastDigestSentDate &&
        user.settings.lastDigestSentDate.toISOString().slice(0, 10) === todayKey
      ) {
        continue;
      }

      const todaysTasks = await this.prisma.task.findMany({
        where: {
          userId: user.id,
          status: { not: 'completed' },
          dueDate: { lte: endOfToday },
        },
        orderBy: { dueDate: 'asc' },
      });

      await this.sendDigestEmail(user.email, todaysTasks);

      await this.prisma.userSettings.update({
        where: { userId: user.id },
        data: { lastDigestSentDate: now },
      });
    }
  }

  private async createNotification(data: {
    userId: string;
    type: string;
    taskId?: string;
    title: string;
    message: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        taskId: data.taskId ?? null,
        title: data.title,
        message: data.message,
      },
    });
  }

  async findAll(userId: string, limit = 50) {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return { items, unreadCount };
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  private async sendTaskNotification(
    to: string,
    task: NotificationTask,
    kind: 'due' | 'overdue',
  ) {
    const subject =
      kind === 'due'
        ? `Reminder: "${task.title}" is due soon`
        : `Overdue: "${task.title}"`;

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>${kind === 'due' ? 'Task due soon' : 'Task overdue'}</h2>
        <p><strong>${escapeHtml(task.title)}</strong></p>
        ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
        <p>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}</p>
        <p>Priority: ${escapeHtml(task.priority)}</p>
        <p><a href="${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/dashboard" style="display:inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">Open Todo</a></p>
      </div>
    `;

    await this.emailService.sendTaskEmail(to, subject, html);
  }

  private async sendDigestEmail(
    to: string,
    tasks: {
      id: string;
      title: string;
      dueDate: Date | null;
      priority: string;
    }[],
  ) {
    const listHtml = tasks.length
      ? tasks
          .map(
            (task) =>
              `<li style="margin-bottom: 8px;"><strong>${escapeHtml(task.title)}</strong> — due ${task.dueDate ? task.dueDate.toISOString().slice(0, 10) : 'no date'} · ${escapeHtml(task.priority)} priority</li>`,
          )
          .join('')
      : '<p>No tasks due today. Enjoy your day!</p>';

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Daily task digest</h2>
        <p>Here's what's on your plate today:</p>
        <ul>${listHtml}</ul>
      </div>
    `;

    await this.emailService.sendTaskEmail(to, 'Your daily task digest', html);
  }
}
