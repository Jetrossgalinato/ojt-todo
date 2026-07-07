<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

import { ref } from "vue"

definePageMeta({
  layout: "default",
})

const email = ref("")
const password = ref("")
const loading = ref(false)
const errorMsg = ref("")

async function handleLogin() {
  errorMsg.value = ""
  loading.value = true
  try {
    // await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    console.log("Logging in with:", email.value, password.value)
  } catch (err: any) {
    errorMsg.value = err?.data?.message || "Login failed. Please try again."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background px-4">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-medium">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="m@example.com"
              required
              class="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label for="password" class="text-sm font-medium">Password</label>
              <a href="#" class="text-sm underline-offset-4 hover:underline">
                Forgot your password?
              </a>
            </div>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <p v-if="errorMsg" class="text-sm text-destructive">
            {{ errorMsg }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="mt-2 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {{ loading ? "Logging in..." : "Login" }}
          </button>
        </form>
      </CardContent>

      <CardFooter class="flex flex-col gap-2">
        <p class="text-center text-sm text-muted-foreground">
          Don't have an account?
          <NuxtLink to="/register" class="underline underline-offset-4">
            Register
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>