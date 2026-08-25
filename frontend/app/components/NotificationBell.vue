<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import { Bell, CheckCheck } from "lucide-vue-next"
import { toast } from "vue-sonner"
import type { AppNotification } from "~/types/notification.type"
import { useNotifications } from "~/composables/useNotifications"
import { useSettings } from "~/composables/useSettings"
import { getApiErrorMessage } from "~/lib/get-api-error"
import { useAuthStore } from "~/stores/auth"
import { SETTINGS_STORAGE_KEY } from "~/constants/settings.constants"

const { fetchNotifications, markRead, markAllRead } = useNotifications()
const { fetchSettings } = useSettings()
const authStore = useAuthStore()

const open = ref(false)
const items = ref<AppNotification[]>([])
const unreadCount = ref(0)
const container = ref<HTMLElement | null>(null)
const soundOn = ref(true)

let seenIds = new Set<string>()
let firstLoad = true

function soundEnabled(): boolean {
  if (!soundOn.value) return false
  if (typeof window === "undefined") return true
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return true
    return JSON.parse(raw).notificationSound !== false
  } catch {
    return true
  }
}

async function loadSoundSetting() {
  if (!authStore.isAuthenticated) return
  try {
    const settings = await fetchSettings()
    soundOn.value = settings.notificationSound
  } catch {
    // keep default (true)
  }
}

function playNotificationSound() {
  if (!soundEnabled()) return
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.type = "sine"
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.55)
  } catch {
    // sound is optional
  }
}

function onToggleBell() {
  open.value = !open.value
}

function alertNotification(notification: AppNotification) {
  toast(notification.title, { description: notification.message })
  playNotificationSound()
}

let pollTimer: ReturnType<typeof setInterval> | null = null
let polling = false

async function load() {
  if (!authStore.isAuthenticated || polling) return
  polling = true
  try {
    const data = await fetchNotifications()
    if (!firstLoad) {
      for (const notification of data.items) {
        if (!seenIds.has(notification.id)) {
          alertNotification(notification)
        }
      }
    }
    seenIds = new Set(data.items.map((n) => n.id))
    firstLoad = false
    items.value = data.items
    unreadCount.value = data.unreadCount
  } catch {
    // silent - polling should not spam error toasts
  } finally {
    polling = false
  }
}

async function onSelect(notification: AppNotification) {
  if (!notification.read) {
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    notification.read = true
    try {
      await markRead(notification.id)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to mark notification as read."))
    }
  }
  open.value = false
  if (notification.taskId) navigateTo("/dashboard")
}

async function onMarkAllRead() {
  if (unreadCount.value === 0) return
  try {
    await markAllRead()
    items.value.forEach((n) => (n.read = true))
    unreadCount.value = 0
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to mark notifications as read."))
  }
}

function onDocumentClick(event: MouseEvent) {
  if (container.value && !container.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  load()
  loadSoundSetting()
  pollTimer = setInterval(() => {
    load()
    loadSoundSetting()
  }, 30_000)
  document.addEventListener("click", onDocumentClick)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
  document.removeEventListener("click", onDocumentClick)
})

function formatTime(value: string) {
  return new Date(value).toLocaleString()
}
</script>

<template>
  <div ref="container" class="relative">
    <button
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-primary-foreground/80 hover:bg-white/10 hover:text-sidebar-primary-foreground transition-colors"
      :title="open ? 'Close notifications' : 'Notifications'"
      @click.stop="onToggleBell"
    >
      <span class="relative">
        <Bell class="w-4 h-4" />
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
        >
          {{ unreadCount > 99 ? "99+" : unreadCount }}
        </span>
      </span>
      Notifications
    </button>

    <div
      v-if="open"
      class="absolute left-0 bottom-full mb-2 w-72 sm:w-80 rounded-xl border border-border bg-card shadow-lg z-50"
    >
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <p class="text-sm font-semibold text-foreground">Notifications</p>
        <button
          v-if="unreadCount > 0"
          class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          @click="onMarkAllRead"
        >
          <CheckCheck class="h-3.5 w-3.5" />
          Mark all as read
        </button>
      </div>

      <ul class="max-h-80 overflow-y-auto py-1">
        <li v-for="notification in items" :key="notification.id">
          <button
            class="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted"
            :class="notification.read ? 'opacity-60' : 'bg-muted/40'"
            @click="onSelect(notification)"
          >
            <span class="flex items-center gap-2">
              <span
                v-if="!notification.read"
                class="h-2 w-2 rounded-full bg-primary"
              />
              <span class="text-sm font-medium text-foreground">
                {{ notification.title }}
              </span>
            </span>
            <span class="text-xs text-muted-foreground">
              {{ notification.message }}
            </span>
            <span class="text-[10px] text-muted-foreground/70">
              {{ formatTime(notification.createdAt) }}
            </span>
          </button>
        </li>
        <li
          v-if="items.length === 0"
          class="px-4 py-8 text-center text-sm text-muted-foreground"
        >
          No notifications yet.
        </li>
      </ul>
    </div>
  </div>
</template>
