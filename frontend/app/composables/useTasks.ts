import type { Task, TaskForm, TodayStats, UpcomingGroup, UpcomingStats, PaginatedResult, UserPreferences, List } from "~/types/tasks.type"
import { useAuthStore } from "~/stores/auth.store"

export function useTasks() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function authHeaders(): Record<string, string> | undefined {
    return authStore.accessToken
      ? { Authorization: `Bearer ${authStore.accessToken}` }
      : undefined
  }

  const apiBase = config.public.apiBase

  async function fetchTasks(): Promise<Task[]> {
    const res = await $fetch<{ data: Task[] }>(`${apiBase}/tasks`, {
      headers: authHeaders(),
    })
    return res.data
  }

  async function fetchLists(): Promise<List[]> {
    return await $fetch<List[]>(`${apiBase}/lists`, {
      headers: authHeaders(),
    })
  }

  async function createList(name: string): Promise<List> {
    return await $fetch<List>(`${apiBase}/lists`, {
      method: "POST",
      headers: authHeaders(),
      body: { name },
    })
  }

  async function createTask(form: TaskForm): Promise<Task> {
    const payload: Record<string, unknown> = {
      title: form.title,
      priority: form.priority,
    }
    if (form.description) payload.description = form.description
    if (form.dueDate) payload.dueDate = form.dueDate
    if (form.dueTime) payload.dueTime = form.dueTime
    if (form.listId) payload.listId = form.listId
    if (form.tags) {
      payload.tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean)
    }

    return await $fetch<Task>(`${apiBase}/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: payload,
    })
  }

  async function updateTask(id: string, data: Partial<Task> | TaskForm): Promise<Task> {
    const payload: Record<string, unknown> = {}
    if ("title" in data && data.title !== undefined) payload.title = data.title
    if ("description" in data && data.description !== undefined) payload.description = data.description || null
    if ("priority" in data && data.priority !== undefined) payload.priority = data.priority
    if ("status" in data && data.status !== undefined) payload.status = data.status
    if ("dueDate" in data && data.dueDate !== undefined) payload.dueDate = data.dueDate || null
    if ("dueTime" in data && data.dueTime !== undefined) payload.dueTime = data.dueTime || null
    if ("listId" in data && data.listId !== undefined) payload.listId = data.listId || null
    if ("tags" in data && data.tags !== undefined) {
      if (typeof data.tags === "string") {
        payload.tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      }
    }

    return await $fetch<Task>(`${apiBase}/tasks/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: payload,
    })
  }

  async function toggleComplete(id: string): Promise<Task> {
    return await $fetch<Task>(`${apiBase}/tasks/${id}/complete`, {
      method: "PATCH",
      headers: authHeaders(),
    })
  }

  async function deleteTask(id: string): Promise<void> {
    await $fetch(`${apiBase}/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
  }

  async function fetchToday(includeOverdue = true): Promise<Task[]> {
    return await $fetch<Task[]>(`${apiBase}/tasks/today?includeOverdue=${includeOverdue}`, {
      headers: authHeaders(),
    })
  }

  async function fetchTodayStats(): Promise<TodayStats> {
    return await $fetch<TodayStats>(`${apiBase}/tasks/stats/today`, {
      headers: authHeaders(),
    })
  }

  async function fetchUpcoming(): Promise<UpcomingGroup> {
    return await $fetch<UpcomingGroup>(`${apiBase}/tasks/upcoming`, {
      headers: authHeaders(),
    })
  }

  async function fetchUpcomingStats(): Promise<UpcomingStats> {
    return await $fetch<UpcomingStats>(`${apiBase}/tasks/stats/upcoming`, {
      headers: authHeaders(),
    })
  }

  async function fetchCompleted(params?: { from?: string; to?: string; page?: number; limit?: number }): Promise<PaginatedResult<Task>> {
    const query = new URLSearchParams()
    if (params?.from) query.set("from", params.from)
    if (params?.to) query.set("to", params.to)
    if (params?.page) query.set("page", String(params.page))
    if (params?.limit) query.set("limit", String(params.limit))
    const qs = query.toString()
    return await $fetch<PaginatedResult<Task>>(`${apiBase}/tasks/completed${qs ? `?${qs}` : ""}`, {
      headers: authHeaders(),
    })
  }

  async function restoreTask(id: string): Promise<Task> {
    return await $fetch<Task>(`${apiBase}/tasks/${id}/restore`, {
      method: "PATCH",
      headers: authHeaders(),
    })
  }

  async function batchDeleteTasks(ids: string[]): Promise<{ deleted: number }> {
    return await $fetch<{ deleted: number }>(`${apiBase}/tasks/batch`, {
      method: "DELETE",
      headers: authHeaders(),
      body: { ids },
    })
  }

  async function getProfile() {
    return await $fetch<{ id: string; email: string; name: string | null; createdAt: string }>(
      `${apiBase}/auth/profile`,
      { headers: authHeaders() },
    )
  }

  async function updateProfile(data: { name?: string; email?: string }) {
    return await $fetch<{ id: string; email: string; name: string | null }>(
      `${apiBase}/auth/profile`,
      { method: "PATCH", headers: authHeaders(), body: data },
    )
  }

  async function deleteAccount(password: string) {
    return await $fetch<{ message: string }>(`${apiBase}/auth/account`, {
      method: "DELETE",
      headers: authHeaders(),
      body: { password },
    })
  }

  async function changePassword(data: { currentPassword: string; newPassword: string }) {
    return await $fetch<{ message: string }>(`${apiBase}/auth/password`, {
      method: "PATCH",
      headers: authHeaders(),
      body: data,
    })
  }

  async function getPreferences(): Promise<UserPreferences> {
    return await $fetch<UserPreferences>(`${apiBase}/auth/preferences`, {
      headers: authHeaders(),
    })
  }

  async function updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    return await $fetch<UserPreferences>(`${apiBase}/auth/preferences`, {
      method: "PATCH",
      headers: authHeaders(),
      body: data,
    })
  }

  return {
    fetchTasks,
    fetchLists,
    createList,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    fetchToday,
    fetchTodayStats,
    fetchUpcoming,
    fetchUpcomingStats,
    fetchCompleted,
    restoreTask,
    batchDeleteTasks,
    getProfile,
    updateProfile,
    deleteAccount,
    changePassword,
    getPreferences,
    updatePreferences,
  }
}
