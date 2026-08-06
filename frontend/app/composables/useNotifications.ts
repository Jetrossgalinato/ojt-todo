import type { AppNotification } from "~/types/notification.type"

export function useNotifications() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function authHeaders(): Record<string, string> | undefined {
    return authStore.accessToken
      ? { Authorization: `Bearer ${authStore.accessToken}` }
      : undefined
  }

  const apiBase = config.public.apiBase

  async function fetchNotifications(
    limit = 50
  ): Promise<{ items: AppNotification[]; unreadCount: number }> {
    return await $fetch<{ items: AppNotification[]; unreadCount: number }>(
      `${apiBase}/notifications`,
      {
        params: { limit },
        headers: authHeaders(),
      }
    )
  }

  async function markRead(id: string): Promise<void> {
    await $fetch<void>(`${apiBase}/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    })
  }

  async function markAllRead(): Promise<void> {
    await $fetch<void>(`${apiBase}/notifications/read-all`, {
      method: "PATCH",
      headers: authHeaders(),
    })
  }

  return { fetchNotifications, markRead, markAllRead }
}
