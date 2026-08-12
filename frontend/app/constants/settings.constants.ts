export const ACCENT_COLORS = [
  "Teal",
  "Pastel Blue",
  "Pastel Green",
  "Pastel Purple",
] as const

export const REMINDER_TIMES = [
  "1 hour before",
  "30 minutes before",
  "2 hours before",
  "1 day before",
] as const

export const DIGEST_TIMES = [
  "8:00 AM",
  "9:00 AM",
  "12:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
] as const

export const DEFAULT_REMINDER_TIME = REMINDER_TIMES[0]
export const DEFAULT_DIGEST_TIME = DIGEST_TIMES[0]
export const SETTINGS_STORAGE_KEY = "user-settings"
