import type { Task, TaskForm } from "~/types/tasks.type"
import { useAuthStore } from "~/stores/auth.store"

export function useTasks() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function authHeaders() {
    return authStore.accessToken
      ? { Authorization: `Bearer ${authStore.accessToken}` }
      : {}
  }

  const apiBase = config.public.apiBase

  async function fetchTasks(): Promise<Task[]> {
    return await $fetch<Task[]>(`${apiBase}/todos`, { headers: authHeaders() })
  }

  async function createTask(form: TaskForm): Promise<Task> {
    return await $fetch<Task>(`${apiBase}/todos`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    })
  }

  async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return await $fetch<Task>(`${apiBase}/todos/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: data,
    })
  }

  async function deleteTask(id: string): Promise<void> {
    await $fetch(`${apiBase}/todos/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
  }

  return { fetchTasks, createTask, updateTask, deleteTask }
}