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

export function getUniqueTags(tasks: TaskItem[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const task of tasks) {
    for (const tag of task.tags ?? []) {
      const name = tag.name?.trim()
      if (!name || seen.has(name)) continue
      seen.add(name)
      result.push(name)
    }
  }

  return result
}

export function filterByTag(tasks: TaskItem[], tagName: string | null): TaskItem[] {
  if (!tagName) return tasks
  const normalized = tagName.trim()
  if (!normalized) return tasks

  return tasks.filter((task) =>
    task.tags.some((tag) => tag.name.trim().toLowerCase() === normalized.toLowerCase())
  )
}

export function getTasksDueToday(tasks: TaskItem[]): TaskItem[] {
  const today = new Date().toISOString().split("T")[0]
  return tasks.filter((task) => {
    if (task.status !== "pending") return false
    if (!task.dueDate) return false
    return task.dueDate === today || new Date(task.dueDate) < new Date(today)
  })
}

export function getCompletedTasks(tasks: TaskItem[]): TaskItem[] {
  return tasks.filter((task) => task.status === "completed")
}

export function getUpcomingGroups(tasks: TaskItem[]): {
  tomorrow: TaskItem[]
  thisWeek: TaskItem[]
  nextWeek: TaskItem[]
  later: TaskItem[]
} {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

  const endOfNextWeek = new Date(endOfWeek)
  endOfNextWeek.setDate(endOfNextWeek.getDate() + 7)

  const result = {
    tomorrow: [] as TaskItem[],
    thisWeek: [] as TaskItem[],
    nextWeek: [] as TaskItem[],
    later: [] as TaskItem[],
  }

  for (const task of tasks) {
    if (task.status !== "pending" || !task.dueDate) continue

    const due = new Date(`${task.dueDate}T00:00:00`)

    if (due.getTime() === tomorrow.getTime()) {
      result.tomorrow.push(task)
      continue
    }

    if (due > today && due <= endOfWeek) {
      result.thisWeek.push(task)
      continue
    }

    if (due > endOfWeek && due <= endOfNextWeek) {
      result.nextWeek.push(task)
      continue
    }

    result.later.push(task)
  }

  return result
}
