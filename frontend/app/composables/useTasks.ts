import type { Task, TaskForm } from "~/types/tasks.type"
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

  async function fetchTasks(): Promise<Task[]> {
    const res = await $fetch<{ data: Task[] }>(`${apiBase}/tasks`, { headers: authHeaders() })
    return res.data
  }

  async function createTask(form: TaskForm): Promise<Task> {
    const payload = {
      ...form,
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
    const payload = {
      ...data,
      dueDate: data.dueDate || undefined,
      dueTime: data.dueTime || undefined,
      listName: data.list,
    }
    return await $fetch<Task>(`${apiBase}/tasks/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: payload,
    })
  }

  async function deleteTask(id: string): Promise<void> {
    await $fetch(`${apiBase}/tasks/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
  }

  return { fetchTasks, createTask, updateTask, deleteTask }
}
