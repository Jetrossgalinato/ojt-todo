import { useAuthStore } from "~/stores/auth"

export interface Tag {
  id: string
  name: string
  userId: string
  createdAt: string
  _count?: { tasks: number }
}

export function useTags() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function authHeaders(): Record<string, string> | undefined {
    return authStore.accessToken
      ? { Authorization: `Bearer ${authStore.accessToken}` }
      : undefined
  }

  const apiBase = config.public.apiBase

  async function fetchTags(): Promise<Tag[]> {
    return await $fetch<Tag[]>(`${apiBase}/tags`, {
      headers: authHeaders(),
    })
  }

  async function createTag(name: string): Promise<Tag> {
    return await $fetch<Tag>(`${apiBase}/tags`, {
      method: "POST",
      body: { name },
      headers: authHeaders(),
    })
  }

  async function deleteTag(id: string): Promise<void> {
    await $fetch(`${apiBase}/tags/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
  }

  return { fetchTags, createTag, deleteTag }
}
