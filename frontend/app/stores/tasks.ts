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
          tags: [],
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
          tags: [],
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
          tags: [],
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
          tags: [],
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
          tags: [],
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
          tags: [],
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
          tags: [],
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
          tags: [],
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
      const config = useRuntimeConfig()
      const authStore = useAuthStore()
      if (!authStore.accessToken) {
        this.initSeedData()
        return
      }

      this.loading = true
      try {
        const res = await $fetch<{ data: TaskItem[] }>(
          `${config.public.apiBase}/tasks`,
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
        )
        this.tasks = res.data
      } catch {
        this.initSeedData()
      } finally {
        this.loading = false
      }
    },

    addTask(data: {
      title: string
      description: string
      priority: "low" | "medium" | "high"
      dueDate: string
      dueTime: string
      list: string
    }) {
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
        tags: [],
        completedAt: null,
      }
      this.tasks.unshift(newTask)
    },

    toggleComplete(id: string) {
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

    updateTask(id: string, data: Partial<TaskItem>) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return
      Object.assign(task, data)
    },

    deleteTask(id: string) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },

    clearCompleted() {
      this.tasks = this.tasks.filter((t) => t.status !== "completed")
    },
  },
})
