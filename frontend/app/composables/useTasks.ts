import type { PaginatedResult, Task, TaskForm } from "~/types/tasks.type"
import { useAuthStore } from "~/stores/auth"
import { tagsToApiPayload } from "~/lib/tags"

export function useTasks() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function authHeaders(): Record<string, string> | undefined {
    return authStore.accessToken
      ? { Authorization: `Bearer ${authStore.accessToken}` }
      : undefined
  }

  const apiBase = config.public.apiBase

  async function fetchTasks(params?: {
    page?: number
    limit?: number
    tag?: string
  }): Promise<PaginatedResult<Task>> {
    const query = new URLSearchParams()
    if (params?.page) query.set("page", String(params.page))
    if (params?.limit) query.set("limit", String(params.limit))
    if (params?.tag) query.set("tag", params.tag)
    const qs = query.toString()
    return await $fetch<PaginatedResult<Task>>(`${apiBase}/tasks${qs ? `?${qs}` : ""}`, {
      headers: authHeaders(),
    })
  }

  async function createTask(form: TaskForm): Promise<Task> {
    const payload = {
      ...form,
      startDate: form.startDate,
      startTime: form.startTime,
      dueDate: form.dueDate || undefined,
      dueTime: form.dueTime || undefined,
      tags: tagsToApiPayload(form.tags),
      listName: form.list,
    }
    return await $fetch<Task>(`${apiBase}/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: payload,
    })
  }

  async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const { tags, list, ...rest } = data
    const payload = {
      ...rest,
      dueDate: data.dueDate || undefined,
      dueTime: data.dueTime || undefined,
      listId: data.listId ?? undefined,
      tags: tags !== undefined ? tagsToApiPayload(typeof tags === "string" ? tags : tags.map((t) => t.name).join(", ")) : undefined,
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

  async function batchDeleteTasks(ids: string[]): Promise<{ deleted: number }> {
    return await $fetch<{ deleted: number }>(`${apiBase}/tasks/batch`, {
      method: "DELETE",
      headers: authHeaders(),
      body: { ids },
    })
  }

  return { fetchTasks, createTask, updateTask, toggleComplete, deleteTask, batchDeleteTasks }
}
