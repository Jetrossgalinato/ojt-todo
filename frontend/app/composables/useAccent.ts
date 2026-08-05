const ACCENT_CLASSES: Record<string, string> = {
  Teal: "accent-teal",
  Blue: "accent-blue",
  Green: "accent-green",
  Purple: "accent-purple",
  Pink: "accent-pink",
  Orange: "accent-orange",
  Slate: "accent-slate",
}

const ACCENT_STORAGE_KEY = "accent-color"

export function applyAccent(color: string): void {
  const root = document.documentElement
  root.classList.remove(...Object.values(ACCENT_CLASSES))
  const className = ACCENT_CLASSES[color]
  if (className) root.classList.add(className)
}

export function loadAccent(): void {
  const saved = localStorage.getItem(ACCENT_STORAGE_KEY)
  applyAccent(saved ?? "Teal")
}

export function saveAccentLocally(color: string): void {
  localStorage.setItem(ACCENT_STORAGE_KEY, color)
}
