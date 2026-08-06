export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  taskId: string | null
  read: boolean
  createdAt: string
}
