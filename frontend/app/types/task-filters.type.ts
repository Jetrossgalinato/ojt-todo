export type TaskTag = {
  id: string
  name: string
}

export type TaskList = {
  id: string
  name: string
}

export type TaskStatus = "pending" | "completed"

export type TaskItem = {
  id: string
  title: string
  description: string | null
  priority: "low" | "medium" | "high"
  status: TaskStatus
  startDate: string | null
  startTime: string | null
  dueDate: string | null
  dueTime: string | null
  completedAt: string | null
  starred: boolean
  userId?: string
  listId?: string | null
  list: TaskList | null
  tags: TaskTag[]
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
}

export type UpcomingGroups = {
  tomorrow: TaskItem[]
  thisWeek: TaskItem[]
  nextWeek: TaskItem[]
  later: TaskItem[]
}
