import { useAuthStore } from "~/stores/auth"
import type { UserSettings } from "~/types/settings.type"

export function useSettings() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function authHeaders(): Record<string, string> | undefined {
    return authStore.accessToken
      ? { Authorization: `Bearer ${authStore.accessToken}` }
      : undefined
  }

  const apiBase = config.public.apiBase

  async function fetchSettings(): Promise<UserSettings> {
    return await $fetch<UserSettings>(`${apiBase}/settings`, {
      headers: authHeaders(),
    })
  }

  async function updateSettings(
    patch: Partial<UserSettings>
  ): Promise<UserSettings> {
    return await $fetch<UserSettings>(`${apiBase}/settings`, {
      method: "PATCH",
      headers: authHeaders(),
      body: patch,
    })
  }

  return { fetchSettings, updateSettings }
}
