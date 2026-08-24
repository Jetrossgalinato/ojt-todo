import { defineStore } from "pinia"
import { useAuthStore } from "~/stores/auth"
import type { TaskItem } from "~/lib/task-filters"
import { getTasksDueToday, getUpcomingGroups } from "~/lib/task-filters"
import { tagsToApiPayload } from "~/lib/tags"

interface TaskPayload {
  title: string
  description?: string | null
  startDate?: string
  startTime?: string
  priority?: "low" | "medium" | "high"
  dueDate?: string | null
  dueTime?: string | null
  list?: string | { id: string; name: string } | null
  tags?: string[] | string
  status?: "pending" | "completed"
}

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    tasks: [] as TaskItem[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getTasksDueToday: (state) => getTasksDueToday(state.tasks),
    getUpcomingTasks: (state) => getUpcomingGroups(state.tasks),
    getCompletedTasks: (state) => state.tasks.filter((task) => task.status === "completed"),
    getPendingTasks: (state) => state.tasks.filter((task) => task.status === "pending"),
  },

  actions: {
    normalizeTask(task: TaskItem): TaskItem {
      const list = typeof task.list === "string"
        ? { id: task.list, name: task.list }
        : task.list ?? null

      return {
        ...task,
        list,
        tags: Array.isArray(task.tags) ? task.tags : [],
        status: task.status ?? "pending",
        dueDate: task.dueDate ?? null,
        dueTime: task.dueTime ?? null,
      }
    },

    async fetchTasks() {
      const authStore = useAuthStore()
      const runtimeConfig = useRuntimeConfig()
      const apiBase = runtimeConfig.public.apiBase

      this.loading = true
      this.error = null

      try {
        const res = await $fetch<{ data?: TaskItem[]; tasks?: TaskItem[] }>(`${apiBase}/tasks`, {
          headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
        })

        const tasks = Array.isArray(res.data) ? res.data : Array.isArray(res.tasks) ? res.tasks : []
        this.tasks = tasks.map((task) => ({
          ...task,
          tags: Array.isArray(task.tags) ? task.tags : [],
          list: task.list ?? null,
          status: task.status ?? "pending",
          dueDate: task.dueDate ?? null,
          dueTime: task.dueTime ?? null,
        }))
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch tasks."
        this.error = message
        this.tasks = []
      } finally {
        this.loading = false
      }
    },

    async addTask(task: TaskPayload) {
      const authStore = useAuthStore()
      const runtimeConfig = useRuntimeConfig()
      const apiBase = runtimeConfig.public.apiBase

      const payload = {
        ...task,
        description: task.description ?? undefined,
        dueDate: task.dueDate || undefined,
        dueTime: task.dueTime || undefined,
        tags: typeof task.tags === "string" ? tagsToApiPayload(task.tags) : task.tags ?? [],
        listName: typeof task.list === "string" ? task.list : task.list?.name ?? undefined,
      }

      const created = await $fetch<TaskItem>(`${apiBase}/tasks`, {
        method: "POST",
        headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
        body: payload,
      })

      const normalizedTask = this.normalizeTask(created)
      this.tasks = [normalizedTask, ...this.tasks]
      return normalizedTask
    },

    async updateTask(id: string, updates: Partial<TaskPayload>) {
      const authStore = useAuthStore()
      const runtimeConfig = useRuntimeConfig()
      const apiBase = runtimeConfig.public.apiBase

      const payload = {
        ...updates,
        dueDate: updates.dueDate ?? undefined,
        dueTime: updates.dueTime ?? undefined,
        listName: typeof updates.list === "string" ? updates.list : updates.list?.name ?? undefined,
        tags: typeof updates.tags === "string"
          ? tagsToApiPayload(updates.tags)
          : updates.tags,
      }

      const updated = await $fetch<TaskItem>(`${apiBase}/tasks/${id}`, {
        method: "PATCH",
        headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
        body: payload,
      })

      const normalizedTask = this.normalizeTask(updated)
      this.tasks = this.tasks.map((task) => (task.id === id ? normalizedTask : task))
      return normalizedTask
    },

    async deleteTask(id: string) {
      const authStore = useAuthStore()
      const runtimeConfig = useRuntimeConfig()
      const apiBase = runtimeConfig.public.apiBase

      await $fetch(`${apiBase}/tasks/${id}`, {
        method: "DELETE",
        headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
      })

      this.tasks = this.tasks.filter((task) => task.id !== id)
    },

    async toggleComplete(id: string) {
      const authStore = useAuthStore()
      const runtimeConfig = useRuntimeConfig()
      const apiBase = runtimeConfig.public.apiBase

      const updated = await $fetch<TaskItem>(`${apiBase}/tasks/${id}/complete`, {
        method: "PATCH",
        headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
      })

      const normalizedTask = this.normalizeTask(updated)
      this.tasks = this.tasks.map((task) => (task.id === id ? normalizedTask : task))
      return normalizedTask
    },
  },
})
