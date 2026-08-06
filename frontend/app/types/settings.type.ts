export interface UserSettings {
  userId: string
  accentColor: string
  dueReminders: boolean
  reminderTime: string
  overdueAlerts: boolean
  dailyDigest: boolean
  digestTime: string
  emailNotifications: boolean
  notificationSound: boolean
  highPriorityOnly: boolean
  lastDigestSentDate: string | null
  updatedAt: string
}
