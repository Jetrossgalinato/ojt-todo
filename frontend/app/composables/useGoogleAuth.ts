import { toast } from "vue-sonner"

export function useGoogleAuth() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  function openGoogleAuth() {
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      `${config.public.apiBase}/auth/google`,
      "google-auth",
      `width=${width},height=${height},left=${left},top=${top},popup=yes`,
    )

    if (!popup) {
      window.location.href = `${config.public.apiBase}/auth/google`
      return
    }

    let processed = false

    const handler = async (event: MessageEvent) => {
      if (processed) return
      if (!event.data?.token) return

      processed = true
      window.removeEventListener("message", handler)

      try {
        const user = await $fetch<{
          id: string
          email: string
          name: string | null
        }>(`${config.public.apiBase}/auth/profile`, {
          headers: { Authorization: `Bearer ${event.data.token}` },
        })

        authStore.setAuth(event.data.token, user)
        toast.success("Login successful", {
          description: `Welcome back, ${user.name || user.email}!`,
        })
        await navigateTo("/dashboard")
      } catch {
        toast.error("Login failed", {
          description: "Could not complete Google sign in.",
        })
      }
    }

    window.addEventListener("message", handler)

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup)
        window.removeEventListener("message", handler)
        if (!processed) {
          toast.info("Sign in cancelled", {
            description: "The Google sign in window was closed.",
          })
        }
      }
    }, 500)
  }

  return { openGoogleAuth }
}
