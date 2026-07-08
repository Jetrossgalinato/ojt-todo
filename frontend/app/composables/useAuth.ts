export function useAuth() {
  async function login(email: string, password: string) {
    const response = await $fetch<{
      accessToken: string
      user: { id: string; email: string; name: string | null }
    }>("http://localhost:4000/auth/login", {
      method: "POST",
      body: { email, password },
    })

    return response
  }

  return {
    login,
  }
}