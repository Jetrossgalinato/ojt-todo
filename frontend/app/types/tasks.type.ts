export interface Task {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  dueTime: string | null
  completedAt: string | null
  priority: "low" | "medium" | "high"
  status: "pending" | "completed"
  tags: { id: string; name: string }[]
  list: { id: string; name: string } | null
  listId: string | null
  starred: boolean
}

export interface TaskForm {
  title: string
  description: string
  dueDate: string
  dueTime: string
  priority: "low" | "medium" | "high"
  listId: string
  tags: string
}

export interface TodayStats {
  todayTotal: number
  todayCompleted: number
  todayRemaining: number
  overdue: number
}

export interface UpcomingGroup {
  tomorrow: Task[]
  thisWeek: Task[]
  nextWeek: Task[]
  later: Task[]
}

export interface UpcomingStats {
  tomorrow: number
  thisWeek: number
  nextWeek: number
  later: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UserPreferences {
  userId: string
  defaultView: string
  timezone: string
  theme: string
  emailNotifications: boolean
  pushNotifications: boolean
}

export interface List {
  id: string
  name: string
  _count?: { tasks: number }
}
