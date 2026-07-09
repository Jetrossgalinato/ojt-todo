export function useAuth() {
  const config = useRuntimeConfig()

  async function login(email: string, password: string) {
    const response = await $fetch<{
      accessToken: string
      user: { id: string; email: string; name: string | null }
    }>(`${config.public.apiBase}/auth/login`, {
      method: "POST",
      body: { email, password },
    })

    return response
  }

  return {
    login,
  }
}