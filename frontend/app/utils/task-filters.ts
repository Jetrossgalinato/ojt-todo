import type { TaskItem, UpcomingGroups } from "~/types/task-filters.type"

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
  if (!tagName?.trim()) return tasks
  const normalized = tagName.trim().toLowerCase()

  return tasks.filter((task) =>
    task.tags.some((tag) => tag.name.trim().toLowerCase() === normalized)
  )
}

export function getTasksDueToday(tasks: TaskItem[]): TaskItem[] {
  const today = new Date().toISOString().slice(0, 10)
  return tasks.filter((task) => {
    if (task.status !== "pending" || !task.dueDate) return false
    return task.dueDate === today || new Date(task.dueDate) < new Date(today)
  })
}

export function getUpcomingGroups(tasks: TaskItem[]): UpcomingGroups {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))

  const endOfNextWeek = new Date(endOfWeek)
  endOfNextWeek.setDate(endOfWeek.getDate() + 7)

  const result: UpcomingGroups = {
    tomorrow: [],
    thisWeek: [],
    nextWeek: [],
    later: [],
  }

  for (const task of tasks) {
    if (task.status !== "pending" || !task.dueDate) continue
    const due = new Date(`${task.dueDate}T00:00:00`)

    if (due.getTime() === tomorrow.getTime()) result.tomorrow.push(task)
    else if (due > today && due <= endOfWeek) result.thisWeek.push(task)
    else if (due > endOfWeek && due <= endOfNextWeek) result.nextWeek.push(task)
    else if (due > endOfNextWeek) result.later.push(task)
  }

  return result
}
