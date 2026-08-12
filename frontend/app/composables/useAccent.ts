import {
  ACCENT_CLASSES,
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT_COLOR,
} from "~/constants/accent.constants"

export function applyAccent(color: string): void {
  const root = document.documentElement
  root.classList.remove(...Object.values(ACCENT_CLASSES))
  const className = ACCENT_CLASSES[color]
  if (className) root.classList.add(className)
}

export function loadAccent(): void {
  const saved = localStorage.getItem(ACCENT_STORAGE_KEY)
  applyAccent(saved ?? DEFAULT_ACCENT_COLOR)
}

export function saveAccentLocally(color: string): void {
  localStorage.setItem(ACCENT_STORAGE_KEY, color)
}
