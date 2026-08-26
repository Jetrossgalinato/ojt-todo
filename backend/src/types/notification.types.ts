export interface NotificationTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: Date | null;
  User: {
    id: string;
    email: string;
    settings: {
      dueReminders: boolean;
      overdueAlerts: boolean;
      reminderTime: string;
      highPriorityOnly: boolean;
      emailNotifications: boolean;
      lastDigestSentDate: Date | null;
    } | null;
    preferences: { timezone: string } | null;
  };
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  taskId: string | null;
  read: boolean;
  createdAt: Date;
}
