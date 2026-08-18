export function validateDueDate(
  startDate: string,
  startTime: string,
  dueDate: string,
  dueTime: string,
): string | null {
  if (!dueDate) return null

  if (dueDate < startDate) {
    return "Due date can't be before the start date."
  }

  if (dueDate === startDate && dueTime && startTime && dueTime < startTime) {
    return "Due time can't be before the start time on the same day."
  }

  return null
}
