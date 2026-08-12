export function getTodayDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function getCurrentTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
}

export function validateDueDate(
  startDate: string,
  startTime: string,
  dueDate: string,
  dueTime: string,
): string | null {
  const today = getTodayDate()
  const now = getCurrentTime()

  if (startDate && startDate < today) {
    return "Start date can't be before today."
  }

  if (startDate === today && startTime && startTime < now) {
    return "Start time can't be in the past."
  }

  if (!dueDate) return null

  if (dueDate < today) {
    return "Due date can't be before today."
  }

  if (dueDate < startDate) {
    return "Due date can't be before the start date."
  }

  if (dueDate === startDate) {
    if (dueTime && startTime && dueTime < startTime) {
      return "Due time can't be before the start time on the same day."
    }
    if (dueTime && dueTime < now) {
      return "Due time can't be in the past."
    }
  } else if (dueDate === today) {
    if (dueTime && dueTime < now) {
      return "Due time can't be in the past."
    }
  }

  return null
}
