export function validateStartDate(startDate: string): string | null {
  if (!startDate) return null

  const today = new Date().toISOString().split("T")[0]
  if (startDate < today) {
    return "Start date cannot be in the past."
  }

  return null
}

export function validateDueDate(
  startDate: string,
  startTime: string,
  dueDate: string,
  dueTime: string,
): string | null {
  if (!dueDate) return null

  const today = new Date().toISOString().split("T")[0]
  if (dueDate < today) {
    return "Due date cannot be in the past."
  }

  if (dueDate < startDate) {
    return "Due date can't be before the start date."
  }

  if (dueDate === startDate && dueTime && startTime && dueTime < startTime) {
    return "Due time can't be before the start time on the same day."
  }

  return null
}
