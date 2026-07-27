import { defineStore } from "pinia"
import type { TaskTag } from "~/types/tasks.type"
import { useAuthStore } from "~/stores/auth"

interface NormalizedTask {
  id: string
  title: string
  description: string
  dueDate: string | null
  dueTime: string | null
  priority: "low" | "medium" | "high"
  status: "pending" | "completed"
  starred: boolean
  listId: string | null
  list: { id: string; name: string } | null
  tags: TaskTag[]
  completedAt: string | null
}

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    tasks: [] as NormalizedTask[],
    loading: false,
  }),

  getters: {
    getTasksDueToday: (state) => {
      const today = new Date().toISOString().split("T")[0]
      return state.tasks.filter(
        (t) => t.status === "pending" && t.dueDate === today
      )
    },

    getUpcomingTasks: (state) => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split("T")[0]

      const endOfWeek = new Date(now)
      endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))
      const endOfWeekStr = endOfWeek.toISOString().split("T")[0]

      const pending = state.tasks.filter((t) => t.status === "pending" && t.dueDate)

      const tomorrowTasks = pending.filter((t) => t.dueDate === tomorrowStr)
      const thisWeekTasks = pending.filter(
        (t) => t.dueDate! > tomorrowStr && t.dueDate! <= endOfWeekStr
      )
      const laterTasks = pending.filter((t) => t.dueDate! > endOfWeekStr)

      return { tomorrow: tomorrowTasks, thisWeek: thisWeekTasks, later: laterTasks }
    },

    getCompletedTasks: (state) => {
      return state.tasks
        .filter((t) => t.status === "completed")
        .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    },

    todayCount(): number {
      return this.getTasksDueToday.length
    },

    upcomingCount(): number {
      const { tomorrow, thisWeek, later } = this.getUpcomingTasks
      return tomorrow.length + thisWeek.length + later.length
    },

    completedCount(): number {
      return this.getCompletedTasks.length
    },
  },

  actions: {
    async fetchTasks() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      if (!authStore.accessToken) return

      this.loading = true
      try {
        const res = await $fetch<{ data: NormalizedTask[] }>(
          `${config.public.apiBase}/tasks`,
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
        )
        this.tasks = res.data
      } catch {
        // silently fail
      } finally {
        this.loading = false
      }
    },

    async toggleComplete(id: string) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      if (!authStore.accessToken) return

      const task = this.tasks.find((t) => t.id === id)
      if (!task) return

      const wasCompleted = task.status === "completed"
      const newStatus = wasCompleted ? "pending" : "completed"

      try {
        const updated = await $fetch<NormalizedTask>(
          `${config.public.apiBase}/tasks/${id}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${authStore.accessToken}` },
            body: {
              status: newStatus,
              completedAt: newStatus === "completed" ? new Date().toISOString() : null,
            },
          }
        )
        Object.assign(task, updated)
      } catch {
        // revert on error
        task.status = wasCompleted ? "completed" : "pending"
      }
    },

    async clearCompleted() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      if (!authStore.accessToken) return

      const completedIds = this.tasks
        .filter((t) => t.status === "completed")
        .map((t) => t.id)

      if (!completedIds.length) return

      try {
        await $fetch(`${config.public.apiBase}/tasks/batch`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authStore.accessToken}` },
          body: { ids: completedIds },
        })
        this.tasks = this.tasks.filter((t) => t.status !== "completed")
      } catch {
        // silently fail
      }
    },
  },
})
