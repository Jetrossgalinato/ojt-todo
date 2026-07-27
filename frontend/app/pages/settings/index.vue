<script setup lang="ts">
import { ref, onMounted } from "vue"
import { toast } from "vue-sonner"
import { useTasksStore } from "~/stores/tasks"

definePageMeta({ layout: "default" })

const store = useTasksStore()

const theme = ref("system")
const defaultView = ref("My tasks")
const dueDateReminders = ref(true)

onMounted(() => {
  store.fetchTasks()
  theme.value = localStorage.getItem("settings:theme") || "system"
  defaultView.value = localStorage.getItem("settings:defaultView") || "My tasks"
  dueDateReminders.value = localStorage.getItem("settings:dueDateReminders") !== "false"
})

function saveSetting(key: string, value: string) {
  localStorage.setItem(`settings:${key}`, value)
}

function saveBoolSetting(key: string, value: boolean) {
  localStorage.setItem(`settings:${key}`, String(value))
}

function exportTasks() {
  const data = JSON.stringify(store.tasks, null, 2)
  const blob = new Blob([data], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "tasks.json"
  a.click()
  URL.revokeObjectURL(url)
  toast.success("Tasks exported")
}

function deleteAllCompleted() {
  if (!confirm("Delete all completed tasks? This can't be undone.")) return
  store.clearCompleted()
  toast.success("Completed tasks deleted")
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <h1 class="text-2xl font-semibold text-foreground">Settings</h1>

    <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div class="px-4 pt-4 pb-2">
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Appearance
        </p>
      </div>
      <div class="border-t border-border">
        <div class="flex items-center justify-between px-4 py-3">
          <div>
            <p class="text-sm font-medium text-foreground">Theme</p>
            <p class="text-xs text-muted-foreground">Choose light, dark, or system</p>
          </div>
          <select
            v-model="theme"
            class="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-teal-500/60"
            @change="saveSetting('theme', theme)"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
      <div class="border-t border-border">
        <div class="flex items-center justify-between px-4 py-3">
          <div>
            <p class="text-sm font-medium text-foreground">Default view</p>
            <p class="text-xs text-muted-foreground">Page shown when you open the app</p>
          </div>
          <select
            v-model="defaultView"
            class="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-teal-500/60"
            @change="saveSetting('defaultView', defaultView)"
          >
            <option value="My tasks">My tasks</option>
            <option value="Today">Today</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div class="px-4 pt-4 pb-2">
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Notifications
        </p>
      </div>
      <div class="border-t border-border">
        <div class="flex items-center justify-between px-4 py-3">
          <div>
            <p class="text-sm font-medium text-foreground">Due date reminders</p>
            <p class="text-xs text-muted-foreground">Get notified before a task is due</p>
          </div>
          <button
            class="relative w-10 h-6 rounded-full transition-colors"
            :class="dueDateReminders ? 'bg-teal-600' : 'bg-gray-300'"
            @click="dueDateReminders = !dueDateReminders; saveBoolSetting('dueDateReminders', dueDateReminders)"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              :class="dueDateReminders ? 'translate-x-4' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div class="px-4 pt-4 pb-2">
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data</p>
      </div>
      <div class="border-t border-border">
        <div class="flex items-center justify-between px-4 py-3">
          <p class="text-sm font-medium text-foreground">Export tasks</p>
          <Button variant="outline" class="h-8 rounded-lg text-xs" @click="exportTasks">
            Export
          </Button>
        </div>
      </div>
      <div class="border-t border-border">
        <div class="flex items-center justify-between px-4 py-3">
          <p class="text-sm font-medium text-red-600">Delete all completed tasks</p>
          <Button
            variant="outline"
            class="h-8 rounded-lg text-xs border-red-300 text-red-600 hover:bg-red-50"
            @click="deleteAllCompleted"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
