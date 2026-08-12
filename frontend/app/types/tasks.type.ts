export interface TaskTag {
  id: string
  name: string
}

export interface TaskList {
  id: string
  name: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  priority: "low" | "medium" | "high"
  status: "pending" | "completed"
  startDate: string
  startTime: string
  dueDate: string | null
  dueTime: string | null
  completedAt: string | null
  starred: boolean
  userId: string
  listId: string | null
  list: TaskList | null
  tags: TaskTag[]
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TaskForm {
  title: string
  description: string
  startDate: string
  startTime: string
  dueDate: string
  dueTime: string
  priority: "low" | "medium" | "high"
  tags: string
  list: string
}
