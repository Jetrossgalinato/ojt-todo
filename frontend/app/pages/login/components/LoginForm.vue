<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { toast } from "vue-sonner"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-vue-next"
import { useAuth } from "@/composables/useAuth"
import { getApiErrorMessage } from "@/lib/get-api-error"

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
)

const { login } = useAuth()
const authStore = useAuthStore()

const isSubmitting = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const shakeError = ref(false)

async function onSubmit(values: Record<string, any>) {
  isSubmitting.value = true

  try {
    const response = await login(values.email, values.password)
    authStore.setAuth(response.accessToken, response.user)
    navigateTo("/dashboard")
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message || "Invalid email or password. Please try again."
  } finally {
    isSubmitting.value = false
  }
}

function loginWithGoogle() {
  // TODO: wire this to your backend's Google OAuth endpoint
  // e.g. window.location.href = `${useRuntimeConfig().public.apiBase}/auth/google`
}
</script>

<template>
  <div class="w-full animate-fade-in-up">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">
        Welcome Back
      </h1>
      <p class="mt-2 text-sm text-muted-foreground">
        Enter your email and password to access your account.
      </p>
    </div>

    <Form
      :validation-schema="formSchema"
      :class="['flex flex-col gap-5', { 'animate-shake': shakeError }]"
      @submit="onSubmit"
      @animationend="shakeError = false"
    >
      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <Label for="email">Email</Label>
          <FormControl>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              class="h-11 rounded-xl"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="password">
        <FormItem>
          <Label for="password">Password</Label>
        
        </div>
        <FormControl>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            v-bind="componentField"
          />
        </FormControl>
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot your password?
          </NuxtLink>
        <FormMessage />
      </FormItem>
    </FormField>

    <p v-if="errorMessage" class="text-sm text-destructive text-center">
      {{ errorMessage }}
    </p>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? "Signing in..." : "Sign in" }}
    </Button>

    <p class="text-center text-sm text-muted-foreground">
      Don't have an account?
      <NuxtLink to="/registration" class="font-medium text-foreground underline underline-offset-4">
        Sign up
      </NuxtLink>
    </p>
  </Form>
</template>