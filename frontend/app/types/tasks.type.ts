export interface TaskTag {
  id: string
  name: string
}

export interface Task {
  id: string
  title: string
  description: string
  startDate: string
  startTime: string
  dueDate: string
  dueTime: string
  priority: "low" | "medium" | "high"
  tags: TaskTag[]
  list: string
  completed: boolean
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