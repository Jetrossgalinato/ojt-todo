// frontend/app/types/tasks.type.ts

export interface Task {
  id: number
  title: string
  description: string
  dueDate: string
  dueTime: string
  priority: "low" | "medium" | "high"
  tags: string
  list: string
  completed: boolean
}

export type TaskForm = Omit<Task, "id" | "completed">