export function useAuth() {
  const config = useRuntimeConfig()

  async function login(email: string, password: string) {
    return await $fetch<{
      accessToken: string
      user: { id: string; email: string; name: string | null }
    }>(`${config.public.apiBase}/auth/login`, {
      method: "POST",
      body: { email, password },
    })
  }

  async function register(name: string, email: string, password: string) {
    return await $fetch<{ message: string }>(
      `${config.public.apiBase}/auth/register`,
      {
        method: "POST",
        body: { name, email, password },
      }
    )
  }

  async function forgotPassword(email: string) {
    return await $fetch<{ message: string }>(
      `${config.public.apiBase}/auth/forgot-password`,
      {
        method: "POST",
        body: { email },
      }
    )
  }

  async function resetPassword(token: string, newPassword: string) {
    return await $fetch<{ message: string }>(
      `${config.public.apiBase}/auth/reset-password`,
      {
        method: "POST",
        body: { token, newPassword },
      }
    )
  }

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
  }
}
