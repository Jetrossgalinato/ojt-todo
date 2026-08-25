import { computed } from "vue"
import { useAuthStore } from "~/stores/auth"
import { tagsToApiPayload } from "~/lib/tags"
import { getTasksDueToday, getUpcomingGroups } from "~/utils/task-filters"
import type { TaskItem, UpcomingGroups } from "~/types/task-filters.type"

type TaskPayload = {
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

function normalizeTask(task: TaskItem): TaskItem {
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
}

export function useTaskState() {
  const tasks = useState<TaskItem[]>("tasks", () => [])
  const loading = useState<boolean>("tasks-loading", () => false)
  const error = useState<string | null>("tasks-error", () => null)
  const authStore = useAuthStore()
  const apiBase = useRuntimeConfig().public.apiBase
  const pendingTasks = computed(() => tasks.value.filter((task) => task.status === "pending"))
  const completedTasks = computed(() => tasks.value.filter((task) => task.status === "completed"))
  const tasksDueToday = computed(() => getTasksDueToday(tasks.value))
  const upcomingTasks = computed<UpcomingGroups>(() => getUpcomingGroups(tasks.value))

  function headers(): Record<string, string> | undefined {
    return authStore.accessToken
      ? { Authorization: `Bearer ${authStore.accessToken}` }
      : undefined
  }

  async function fetchTasks() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ data?: TaskItem[]; tasks?: TaskItem[] }>(`${apiBase}/tasks`, {
        headers: headers(),
      })
      const receivedTasks = Array.isArray(response.data) ? response.data : response.tasks ?? []
      tasks.value = receivedTasks.map(normalizeTask)
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to fetch tasks."
      tasks.value = []
    } finally {
      loading.value = false
    }
  }

  async function addTask(task: TaskPayload) {
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
      headers: headers(),
      body: payload,
    })
    const normalizedTask = normalizeTask(created)
    tasks.value = [normalizedTask, ...tasks.value]
    return normalizedTask
  }

  async function updateTask(id: string, updates: Partial<TaskPayload>) {
    const payload = {
      ...updates,
      dueDate: updates.dueDate ?? undefined,
      dueTime: updates.dueTime ?? undefined,
      listName: typeof updates.list === "string" ? updates.list : updates.list?.name ?? undefined,
      tags: typeof updates.tags === "string" ? tagsToApiPayload(updates.tags) : updates.tags,
    }
    const updated = await $fetch<TaskItem>(`${apiBase}/tasks/${id}`, {
      method: "PATCH",
      headers: headers(),
      body: payload,
    })
    const normalizedTask = normalizeTask(updated)
    tasks.value = tasks.value.map((task) => task.id === id ? normalizedTask : task)
    return normalizedTask
  }

  async function deleteTask(id: string) {
    await $fetch(`${apiBase}/tasks/${id}`, { method: "DELETE", headers: headers() })
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  async function toggleComplete(id: string) {
    const updated = await $fetch<TaskItem>(`${apiBase}/tasks/${id}/complete`, {
      method: "PATCH",
      headers: headers(),
    })
    const normalizedTask = normalizeTask(updated)
    tasks.value = tasks.value.map((task) => task.id === id ? normalizedTask : task)
    return normalizedTask
  }

  return {
    tasks,
    loading,
    error,
    pendingTasks,
    completedTasks,
    tasksDueToday,
    upcomingTasks,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
  }
}
