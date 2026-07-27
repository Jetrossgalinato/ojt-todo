import { defineStore } from "pinia"
import type { TaskTag } from "~/types/tasks.type"
import { useAuthStore } from "~/stores/auth"
import {
  getTasksDueToday,
  getUpcomingGroups,
  getCompletedTasks,
  type TaskItem,
} from "~/lib/task-filters"

export const useTasksStore = defineStore("tasks", {
  state: () => ({
    tasks: [] as TaskItem[],
    loading: false,
    initialized: false,
  }),

  getters: {
    getTasksDueToday: (state) => getTasksDueToday(state.tasks),
    getUpcomingTasks: (state) => getUpcomingGroups(state.tasks),
    getCompletedTasks: (state) => getCompletedTasks(state.tasks),

    todayCount(): number {
      return this.getTasksDueToday.length
    },

    upcomingCount(): number {
      const g = this.getUpcomingTasks
      return g.tomorrow.length + g.thisWeek.length + g.nextWeek.length + g.later.length
    },

    completedCount(): number {
      return this.getCompletedTasks.length
    },
  },

  actions: {
    initSeedData() {
      if (this.initialized) return
      const today = new Date().toISOString().split("T")[0]
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split("T")[0]

      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 8)
      const nextWeekStr = nextWeek.toISOString().split("T")[0]

      const twoWeeks = new Date()
      twoWeeks.setDate(twoWeeks.getDate() + 14)
      const twoWeeksStr = twoWeeks.toISOString().split("T")[0]

      const past1 = new Date()
      past1.setDate(past1.getDate() - 1)
      const past1Str = past1.toISOString().split("T")[0]

      const past2 = new Date()
      past2.setDate(past2.getDate() - 2)
      const past2Str = past2.toISOString().split("T")[0]

      const past3 = new Date()
      past3.setDate(past3.getDate() - 3)
      const past3Str = past3.toISOString().split("T")[0]

      this.tasks = [
        {
          id: "seed-1",
          title: "Submit report",
          description: "quarterly summary",
          dueDate: today,
          dueTime: "09:00",
          priority: "high",
          status: "pending",
          starred: false,
          listId: null,
          list: { id: "work", name: "Work" },
          tags: [{ id: "seed-tag-work", name: "work" }],
          completedAt: null,
        },
        {
          id: "seed-2",
          title: "Buy groceries",
          description: "milk, eggs, bread",
          dueDate: today,
          dueTime: "18:00",
          priority: "low",
          status: "pending",
          starred: false,
          listId: null,
          list: { id: "errands", name: "Errands" },
          tags: [{ id: "seed-tag-home", name: "home" }],
          completedAt: null,
        },
        {
          id: "seed-3",
          title: "Team standup",
          description: "weekly sync",
          dueDate: tomorrowStr,
          dueTime: "09:00",
          priority: "medium",
          status: "pending",
          starred: false,
          listId: null,
          list: { id: "work", name: "Work" },
          tags: [{ id: "seed-tag-work2", name: "work" }],
          completedAt: null,
        },
        {
          id: "seed-4",
          title: "Renew car insurance",
          description: "",
          dueDate: tomorrowStr,
          dueTime: "17:00",
          priority: "low",
          status: "pending",
          starred: false,
          listId: null,
          list: { id: "personal", name: "Personal" },
          tags: [{ id: "seed-tag-finance", name: "finance" }],
          completedAt: null,
        },
        {
          id: "seed-5",
          title: "Doctor appointment",
          description: "",
          dueDate: nextWeekStr,
          dueTime: "10:00",
          priority: "high",
          status: "pending",
          starred: false,
          listId: null,
          list: { id: "personal", name: "Personal" },
          tags: [{ id: "seed-tag-health", name: "health" }],
          completedAt: null,
        },
        {
          id: "seed-6",
          title: "Pay rent",
          description: "",
          dueDate: twoWeeksStr,
          dueTime: null,
          priority: "medium",
          status: "pending",
          starred: false,
          listId: null,
          list: { id: "personal", name: "Personal" },
          tags: [{ id: "seed-tag-finance2", name: "finance" }],
          completedAt: null,
        },
        {
          id: "seed-7",
          title: "Fix login bug",
          description: "",
          dueDate: past1Str,
          dueTime: "14:00",
          priority: "high",
          status: "completed",
          starred: false,
          listId: null,
          list: { id: "work", name: "Work" },
          tags: [{ id: "seed-tag-work3", name: "work" }],
          completedAt: `${past1Str}T14:20:00.000Z`,
        },
        {
          id: "seed-8",
          title: "Call the dentist",
          description: "",
          dueDate: past2Str,
          dueTime: "10:00",
          priority: "medium",
          status: "completed",
          starred: false,
          listId: null,
          list: { id: "personal", name: "Personal" },
          tags: [{ id: "seed-tag-health2", name: "health" }],
          completedAt: `${past2Str}T10:05:00.000Z`,
        },
        {
          id: "seed-9",
          title: "Water the plants",
          description: "",
          dueDate: past3Str,
          dueTime: "08:00",
          priority: "low",
          status: "completed",
          starred: false,
          listId: null,
          list: { id: "errands", name: "Errands" },
          tags: [],
          completedAt: `${past3Str}T08:00:00.000Z`,
        },
      ]
      this.initialized = true
    },

    async fetchTasks() {
      if (this.initialized) return

      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      if (!authStore.accessToken) {
        this.initSeedData()
        return
      }

      this.loading = true
      try {
        const res = await $fetch<{ data: TaskItem[] }>(
          `${config.public.apiBase}/tasks?limit=100`,
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
        )
        this.tasks = res.data
        this.initialized = true
      } catch {
        this.initSeedData()
      } finally {
        this.loading = false
      }
    },

    async addTask(data: {
      title: string
      description: string
      priority: "low" | "medium" | "high"
      dueDate: string
      dueTime: string
      list: string
      tags?: string[]
    }) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()

      if (authStore.accessToken) {
        try {
          const created = await $fetch<TaskItem>(
            `${config.public.apiBase}/tasks`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${authStore.accessToken}` },
              body: {
                title: data.title,
                description: data.description || undefined,
                priority: data.priority,
                dueDate: data.dueDate || undefined,
                dueTime: data.dueTime || undefined,
                listId: data.list || undefined,
                tags: data.tags ?? [],
              },
            }
          )
          this.tasks.unshift(created)
          return
        } catch {
          // fall through to local-only add
        }
      }

      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate || null,
        dueTime: data.dueTime || null,
        priority: data.priority,
        status: "pending",
        starred: false,
        listId: null,
        list: data.list ? { id: data.list, name: data.list } : null,
        tags: (data.tags ?? []).map((name, i) => ({ id: `tag-${Date.now()}-${i}`, name })),
        completedAt: null,
      }
      this.tasks.unshift(newTask)
    },

    async toggleComplete(id: string) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()

      if (authStore.accessToken) {
        try {
          const updated = await $fetch<TaskItem>(
            `${config.public.apiBase}/tasks/${id}/complete`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${authStore.accessToken}` },
            }
          )
          const idx = this.tasks.findIndex((t) => t.id === id)
          if (idx !== -1) this.tasks[idx] = updated
          return
        } catch {
          // fall through to local-only toggle
        }
      }

      const task = this.tasks.find((t) => t.id === id)
      if (!task) return

      if (task.status === "completed") {
        task.status = "pending"
        task.completedAt = null
      } else {
        task.status = "completed"
        task.completedAt = new Date().toISOString()
      }
    },

    async updateTask(id: string, data: Partial<TaskItem> & { tags?: string[] }) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()

      if (authStore.accessToken) {
        try {
          const updated = await $fetch<TaskItem>(
            `${config.public.apiBase}/tasks/${id}`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${authStore.accessToken}` },
              body: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.priority !== undefined && { priority: data.priority }),
                ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
                ...(data.dueTime !== undefined && { dueTime: data.dueTime }),
                ...(data.list !== undefined && { listId: (data.list as any)?.id ?? null }),
                ...(data.tags !== undefined && { tags: data.tags }),
              },
            }
          )
          const idx = this.tasks.findIndex((t) => t.id === id)
          if (idx !== -1) this.tasks[idx] = updated
          return
        } catch {
          // fall through to local-only update
        }
      }

      const task = this.tasks.find((t) => t.id === id)
      if (!task) return

      if (data.tags !== undefined) {
        const { tags, ...rest } = data
        task.tags = tags.map((name, i) => ({ id: `tag-${Date.now()}-${i}`, name }))
        Object.assign(task, rest)
      } else {
        Object.assign(task, data)
      }
    },

    async deleteTask(id: string) {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()

      if (authStore.accessToken) {
        try {
          await $fetch(`${config.public.apiBase}/tasks/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authStore.accessToken}` },
          })
          this.tasks = this.tasks.filter((t) => t.id !== id)
          return
        } catch {
          // fall through to local-only delete
        }
      }

      this.tasks = this.tasks.filter((t) => t.id !== id)
    },

    async clearCompleted() {
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      const completedIds = this.tasks
        .filter((t) => t.status === "completed")
        .map((t) => t.id)

      if (authStore.accessToken && completedIds.length > 0) {
        try {
          await $fetch(`${config.public.apiBase}/tasks/batch`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authStore.accessToken}` },
            body: { ids: completedIds },
          })
          this.tasks = this.tasks.filter((t) => t.status !== "completed")
          return
        } catch {
          // fall through to local-only clear
        }
      }

      this.tasks = this.tasks.filter((t) => t.status !== "completed")
    },
  },
})