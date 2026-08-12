<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue"
import { toast } from "vue-sonner"
import { useSettings } from "~/composables/useSettings"
import type { UserSettings } from "~/types/settings.type"
import { applyAccent, saveAccentLocally } from "~/composables/useAccent"
import { getApiErrorMessage } from "~/lib/get-api-error"
import {
  ACCENT_COLORS,
  REMINDER_TIMES,
  DIGEST_TIMES,
  DEFAULT_REMINDER_TIME,
  DEFAULT_DIGEST_TIME,
  SETTINGS_STORAGE_KEY,
} from "~/constants/settings.constants"
import { DEFAULT_ACCENT_COLOR } from "~/constants/accent.constants"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

definePageMeta({ layout: "default" })

const { fetchSettings, updateSettings } = useSettings()

const saved = ref(false)

let hydrated = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

function defaultSettings(): UserSettings {
  return {
    userId: "",
    accentColor: DEFAULT_ACCENT_COLOR,
    dueReminders: true,
    reminderTime: DEFAULT_REMINDER_TIME,
    overdueAlerts: true,
    dailyDigest: false,
    digestTime: DEFAULT_DIGEST_TIME,
    emailNotifications: false,
    notificationSound: true,
    highPriorityOnly: false,
    lastDigestSentDate: null,
    updatedAt: "",
  }
}

function loadLocalSettings(): UserSettings {
  if (typeof window === "undefined") return defaultSettings()
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return defaultSettings()
    return { ...defaultSettings(), ...JSON.parse(raw) }
  } catch {
    return defaultSettings()
  }
}

const form = reactive<UserSettings>(defaultSettings())

onMounted(async () => {
  Object.assign(form, loadLocalSettings())
  try {
    const serverSettings = await fetchSettings()
    Object.assign(form, defaultSettings(), serverSettings)
    saveLocally()
  } catch {
    // server unavailable — keep local values
  }
  applyAccent(form.accentColor)
  hydrated = true
})

watch(
  () => form.accentColor,
  (color) => {
    if (!hydrated) return
    applyAccent(color)
    saveAccentLocally(color)
  }
)

watch(
  form,
  () => {
    if (!hydrated) return
    saveLocally()
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(saveToServer, 600)
  },
  { deep: true }
)

function saveLocally() {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(form))
  } catch {
    // ignore quota errors
  }
}

async function saveToServer() {
  try {
    await updateSettings({
      accentColor: form.accentColor,
      dueReminders: form.dueReminders,
      reminderTime: form.reminderTime,
      overdueAlerts: form.overdueAlerts,
      dailyDigest: form.dailyDigest,
      digestTime: form.digestTime,
      emailNotifications: form.emailNotifications,
      notificationSound: form.notificationSound,
      highPriorityOnly: form.highPriorityOnly,
    })
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 2500)
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to sync settings."))
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div>
      <h1 class="text-2xl font-semibold text-foreground">Settings</h1>
      <p class="text-sm text-muted-foreground mt-1">
        Manage your theme and task notifications.
      </p>
    </div>

    <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your accent color.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center justify-between gap-4">
            <Label for="accent-color">Accent color</Label>
            <select
              id="accent-color"
              v-model="form.accentColor"
              class="h-9 max-w-[200px] rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/60"
            >
              <option v-for="color in ACCENT_COLORS" :key="color" :value="color">
                {{ color }}
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Task Notifications</CardTitle>
          <CardDescription>Control how and when you get reminded.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">Due reminders</p>
              <p class="text-xs text-muted-foreground">
                Notify me before a task's due date.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <select
                v-model="form.reminderTime"
                class="h-9 max-w-[180px] rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/60"
                :disabled="!form.dueReminders"
              >
                <option v-for="time in REMINDER_TIMES" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
              <Switch v-model:checked="form.dueReminders" />
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">Overdue alerts</p>
              <p class="text-xs text-muted-foreground">
                Notify me when a task becomes overdue.
              </p>
            </div>
            <Switch v-model:checked="form.overdueAlerts" />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">Daily digest</p>
              <p class="text-xs text-muted-foreground">
                Send me a summary email of the day's tasks.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <select
                v-model="form.digestTime"
                class="h-9 max-w-[180px] rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/60"
                :disabled="!form.dailyDigest"
              >
                <option v-for="time in DIGEST_TIMES" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
              <Switch v-model:checked="form.dailyDigest" />
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">Email notifications</p>
              <p class="text-xs text-muted-foreground">
                Receive reminder and alert emails.
              </p>
            </div>
            <Switch v-model:checked="form.emailNotifications" />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">Notification sound</p>
              <p class="text-xs text-muted-foreground">
                Play a sound for notifications.
              </p>
            </div>
            <Switch v-model:checked="form.notificationSound" />
          </div>

          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-foreground">High priority only</p>
              <p class="text-xs text-muted-foreground">
                Only notify me about high priority tasks.
              </p>
            </div>
            <Switch v-model:checked="form.highPriorityOnly" />
          </div>
        </CardContent>
      </Card>

      <div class="flex min-h-[36px] items-center justify-end gap-3">
        <span v-if="saved" class="text-xs text-emerald-600">
          All changes saved ✓
        </span>
      </div>
  </div>
</template>
