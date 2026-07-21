import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import {
  NormalizedTask,
  PaginatedResult,
  TaskStats,
  TodayStats,
  UpcomingGroup,
  UpcomingStats,
} from './task.types';

interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: Date | null;
  dueTime: string | null;
  completedAt: Date | null;
  starred: boolean;
  userId: string;
  listId: string | null;
  list: { id: string; name: string } | null;
  tags: { Tag: { id: string; name: string } }[];
  createdAt: Date;
  updatedAt: Date;
}

function normalizeTask(task: TaskWithRelations): NormalizedTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
    dueTime: task.dueTime ?? null,
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    starred: task.starred,
    userId: task.userId,
    listId: task.listId ?? null,
    list: task.list ? { id: task.list.id, name: task.list.name } : null,
    tags: task.tags.map((t) => ({ id: t.Tag.id, name: t.Tag.name })),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

const taskInclude = {
  list: { select: { id: true, name: true } },
  tags: { include: { Tag: { select: { id: true, name: true } } } },
} as const;

function getDateRanges() {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const startOfTomorrow = new Date(endOfToday);
  const endOfTomorrow = new Date(startOfTomorrow);
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

  const startOfNextWeek = new Date(endOfWeek);
  const endOfNextWeek = new Date(startOfNextWeek);
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

  return {
    now,
    startOfToday,
    endOfToday,
    startOfTomorrow,
    endOfTomorrow,
    endOfWeek,
    startOfNextWeek,
    endOfNextWeek,
  };
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      priority?: string;
      listId?: string;
      tag?: string;
      status?: string;
      sort?: string;
    },
  ): Promise<PaginatedResult<NormalizedTask>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (query.priority) where.priority = query.priority;
    if (query.listId) where.listId = query.listId;
    if (query.status) where.status = query.status;
    if (query.tag) {
      where.tags = { some: { Tag: { name: query.tag } } };
    }

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      orderBy = { [field]: direction === 'asc' ? 'asc' : 'desc' };
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks.map(normalizeTask),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(userId: string): Promise<TaskStats> {
    const now = new Date();

    const [pending, completed, overdue, total] = await Promise.all([
      this.prisma.task.count({ where: { userId, status: 'pending' } }),
      this.prisma.task.count({ where: { userId, status: 'completed' } }),
      this.prisma.task.count({
        where: { userId, status: 'pending', dueDate: { lt: now } },
      }),
      this.prisma.task.count({ where: { userId } }),
    ]);

    return { pending, completed, overdue, total };
  }

  async findToday(
    userId: string,
    includeOverdue = true,
  ): Promise<NormalizedTask[]> {
    const { startOfToday, endOfToday } = getDateRanges();

    const where: Record<string, unknown> = {
      userId,
      status: 'pending',
      OR: [
        { dueDate: { gte: startOfToday, lt: endOfToday } },
        ...(includeOverdue
          ? [{ dueDate: { lt: startOfToday }, status: 'pending' }]
          : []),
      ],
    };

    const tasks = await this.prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });

    return tasks.map(normalizeTask);
  }

  async getTodayStats(userId: string): Promise<TodayStats> {
    const { startOfToday, endOfToday } = getDateRanges();

    const [todayTotal, todayCompleted, overdue] = await Promise.all([
      this.prisma.task.count({
        where: {
          userId,
          OR: [
            { dueDate: { gte: startOfToday, lt: endOfToday } },
            { dueDate: { lt: startOfToday }, status: 'pending' },
          ],
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'completed',
          completedAt: { gte: startOfToday, lt: endOfToday },
        },
      }),
      this.prisma.task.count({
        where: { userId, status: 'pending', dueDate: { lt: startOfToday } },
      }),
    ]);

    return {
      todayTotal,
      todayCompleted,
      todayRemaining: todayTotal - todayCompleted,
      overdue,
    };
  }

  async findUpcoming(userId: string): Promise<UpcomingGroup> {
    const {
      startOfTomorrow,
      endOfTomorrow,
      endOfWeek,
      startOfNextWeek,
      endOfNextWeek,
    } = getDateRanges();

    const [tomorrow, thisWeek, nextWeek, later] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId,
          status: 'pending',
          dueDate: { gte: startOfTomorrow, lt: endOfTomorrow },
        },
        include: taskInclude,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.task.findMany({
        where: {
          userId,
          status: 'pending',
          dueDate: { gte: endOfTomorrow, lt: endOfWeek },
        },
        include: taskInclude,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.task.findMany({
        where: {
          userId,
          status: 'pending',
          dueDate: { gte: startOfNextWeek, lt: endOfNextWeek },
        },
        include: taskInclude,
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.task.findMany({
        where: {
          userId,
          status: 'pending',
          dueDate: { gte: endOfNextWeek },
        },
        include: taskInclude,
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    return {
      tomorrow: tomorrow.map(normalizeTask),
      thisWeek: thisWeek.map(normalizeTask),
      nextWeek: nextWeek.map(normalizeTask),
      later: later.map(normalizeTask),
    };
  }

  async getUpcomingStats(userId: string): Promise<UpcomingStats> {
    const {
      startOfTomorrow,
      endOfTomorrow,
      endOfWeek,
      startOfNextWeek,
      endOfNextWeek,
    } = getDateRanges();

    const [tomorrow, thisWeek, nextWeek, later] = await Promise.all([
      this.prisma.task.count({
        where: {
          userId,
          status: 'pending',
          dueDate: { gte: startOfTomorrow, lt: endOfTomorrow },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'pending',
          dueDate: { gte: endOfTomorrow, lt: endOfWeek },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'pending',
          dueDate: { gte: startOfNextWeek, lt: endOfNextWeek },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          status: 'pending',
          dueDate: { gte: endOfNextWeek },
        },
      }),
    ]);

    return { tomorrow, thisWeek, nextWeek, later };
  }

  async findCompleted(
    userId: string,
    query: { from?: string; to?: string; page?: number; limit?: number },
  ): Promise<PaginatedResult<NormalizedTask>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId, status: 'completed' };

    if (query.from || query.to) {
      where.completedAt = {};
      if (query.from)
        (where.completedAt as Record<string, unknown>).gte = new Date(
          query.from,
        );
      if (query.to)
        (where.completedAt as Record<string, unknown>).lte = new Date(query.to);
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks.map(normalizeTask),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(userId: string, id: string): Promise<NormalizedTask> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
      include: taskInclude,
    });
    if (!task) throw new NotFoundException('Task not found');
    return normalizeTask(task);
  }

  async create(userId: string, dto: CreateTaskDto): Promise<NormalizedTask> {
    const tagConnections: { tagId: string }[] = [];

    if (dto.tagIds?.length) {
      for (const tagId of dto.tagIds) {
        tagConnections.push({ tagId });
      }
    }

    if (dto.tags?.length) {
      for (const tagName of dto.tags) {
        const trimmed = tagName.trim();
        if (!trimmed) continue;
        const tag = await this.prisma.tag.upsert({
          where: { userId_name: { userId, name: trimmed } },
          create: { name: trimmed, userId },
          update: {},
        });
        tagConnections.push({ tagId: tag.id });
      }
    }

    const task = await this.prisma.task.create({
      data: {
        id: randomUUID(),
        title: dto.title,
        description: dto.description ?? null,
        priority: dto.priority ?? 'medium',
        status: dto.status ?? 'pending',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        dueTime: dto.dueTime ?? null,
        starred: dto.starred ?? false,
        userId,
        listId: dto.listId ?? null,
        ...(tagConnections.length ? { tags: { create: tagConnections } } : {}),
      },
      include: taskInclude,
    });
    return normalizeTask(task);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTaskDto,
  ): Promise<NormalizedTask> {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');

    const { tagIds, tags, ...rest } = dto;

    const updateData: Record<string, unknown> = {
      ...(rest.title !== undefined ? { title: rest.title } : {}),
      ...(rest.description !== undefined
        ? { description: rest.description ?? null }
        : {}),
      ...(rest.priority !== undefined ? { priority: rest.priority } : {}),
      ...(rest.status !== undefined ? { status: rest.status } : {}),
      ...(rest.starred !== undefined ? { starred: rest.starred } : {}),
      ...(rest.listId !== undefined ? { listId: rest.listId ?? null } : {}),
      ...(rest.dueDate !== undefined
        ? { dueDate: rest.dueDate ? new Date(rest.dueDate) : null }
        : {}),
      ...(rest.dueTime !== undefined ? { dueTime: rest.dueTime ?? null } : {}),
    };

    if (tagIds !== undefined || tags !== undefined) {
      await this.prisma.taskTag.deleteMany({ where: { taskId: id } });
      const tagConnections: { tagId: string }[] = [];

      if (tagIds?.length) {
        for (const tagId of tagIds) {
          tagConnections.push({ tagId });
        }
      }

      if (tags?.length) {
        for (const tagName of tags) {
          const trimmed = tagName.trim();
          if (!trimmed) continue;
          const tag = await this.prisma.tag.upsert({
            where: { userId_name: { userId, name: trimmed } },
            create: { name: trimmed, userId },
            update: {},
          });
          tagConnections.push({ tagId: tag.id });
        }
      }

      if (tagConnections.length) {
        updateData.tags = { create: tagConnections };
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: updateData,
      include: taskInclude,
    });
    return normalizeTask(updated);
  }

  async toggleComplete(userId: string, id: string): Promise<NormalizedTask> {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');

    const isCompleting = task.status !== 'completed';

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        status: isCompleting ? 'completed' : 'pending',
        completedAt: isCompleting ? new Date() : null,
      },
      include: taskInclude,
    });
    return normalizeTask(updated);
  }

  async restore(userId: string, id: string): Promise<NormalizedTask> {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status !== 'completed') {
      throw new BadRequestException('Task is not completed');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: 'pending', completedAt: null },
      include: taskInclude,
    });
    return normalizeTask(updated);
  }

  async batchDelete(
    userId: string,
    ids: string[],
  ): Promise<{ deleted: number }> {
    if (!ids.length) throw new BadRequestException('No task IDs provided');

    const result = await this.prisma.task.deleteMany({
      where: { id: { in: ids }, userId },
    });
    return { deleted: result.count };
  }

  async remove(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.task.delete({ where: { id } });
  }
}
