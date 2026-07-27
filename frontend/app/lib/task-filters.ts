export interface TaskItem {
  id: string
  title: string
  description: string
  dueDate: string | null
  dueTime: string | null
  priority: "low" | "medium" | "high"
  status: "pending" | "completed"
  starred: boolean
  listId: string | null
  list: { id: string; name: string } | null
  tags: { id: string; name: string }[]
  completedAt: string | null
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toStr(d: Date): string {
  return d.toISOString().split("T")[0]
}

export function getTasksDueToday(tasks: TaskItem[]): TaskItem[] {
  const today = todayStr()
  return tasks.filter((t) => t.status === "pending" && t.dueDate === today)
}

export function getUpcomingGroups(tasks: TaskItem[]) {
  const now = new Date()
  const today = todayStr()
  const tomorrow = toStr(addDays(now, 1))

  const endOfWeek = new Date(now)
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))
  const endOfWeekStr = toStr(endOfWeek)

  const startOfNextWeek = addDays(endOfWeek, 1)
  const endOfNextWeek = addDays(startOfNextWeek, 6)
  const nextWeekStr = toStr(endOfNextWeek)

  const pending = tasks.filter((t) => t.status === "pending" && t.dueDate && t.dueDate > today)

  const tomorrowTasks = pending.filter((t) => t.dueDate === tomorrow)
  const thisWeekTasks = pending.filter(
    (t) => t.dueDate! > tomorrow && t.dueDate! <= endOfWeekStr
  )
  const nextWeekTasks = pending.filter(
    (t) => t.dueDate! > endOfWeekStr && t.dueDate! <= nextWeekStr
  )
  const laterTasks = pending.filter((t) => t.dueDate! > nextWeekStr)

  return { tomorrow: tomorrowTasks, thisWeek: thisWeekTasks, nextWeek: nextWeekTasks, later: laterTasks }
}

export function getCompletedTasks(tasks: TaskItem[]): TaskItem[] {
  return tasks
    .filter((t) => t.status === "completed")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
}

export function getUniqueTags(tasks: TaskItem[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const task of tasks) {
    for (const tag of task.tags) {
      if (tag.name && !seen.has(tag.name)) {
        seen.add(tag.name)
        result.push(tag.name)
      }
    }
  }
  return result
}

export function filterByTag(tasks: TaskItem[], selectedTag: string | null): TaskItem[] {
  if (!selectedTag) return tasks
  return tasks.filter((t) => t.tags.some((tag) => tag.name === selectedTag))
}
