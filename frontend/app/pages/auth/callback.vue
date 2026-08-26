<script setup lang="ts">
import { toast } from "vue-sonner"
import { useAuthStore } from "@/stores/auth"

definePageMeta({
  layout: false,
})

const route = useRoute()
const config = useRuntimeConfig()
const authStore = useAuthStore()

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    toast.error("Login failed", {
      description: "No token received from Google.",
    })
    navigateTo("/login")
    return
  }

  try {
    const user = await $fetch<{
      id: string
      email: string
      name: string | null
    }>(`${config.public.apiBase}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    authStore.setAuth(token, user)
    toast.success("Login successful", {
      description: `Welcome back, ${user.name || user.email}!`,
    })
    navigateTo("/dashboard")
  } catch {
    toast.error("Login failed", {
      description: "Could not complete Google sign in.",
    })
    navigateTo("/login")
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
    <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    <p class="text-sm text-muted-foreground">Signing you in...</p>
  </div>
</template>
