export function formatTaskTime(dateValue: string | null): string {
  if (!dateValue) return ""
  return new Date(dateValue).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function formatSectionDate(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`)
  const month = date.toLocaleString("en-US", { month: "short" }).toLowerCase()
  const day = date.getDate().toString().padStart(2, "0")
  return `${month} ${day}`
}

export function getTomorrowDateLabel(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatSectionDate(tomorrow.toISOString().slice(0, 10))
}
