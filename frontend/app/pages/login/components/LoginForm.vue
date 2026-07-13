<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-vue-next"
import { toast } from "vue-sonner"
import { useAuth } from "@/composables/useAuth"
import { useAuthStore } from "@/stores/auth"

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
)

const { login } = useAuth()
const authStore = useAuthStore()

const errorMessage = ref("")
const isSubmitting = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const shakeError = ref(false)

async function onSubmit(values: Record<string, any>) {
  errorMessage.value = ""
  isSubmitting.value = true

  try {
    const response = await login(values.email, values.password)
    authStore.setAuth(response.accessToken, response.user)
    toast.success("Login successful", {
      description: `Welcome back, ${response.user?.name || response.user?.email}!`,
    })
    navigateTo("/dashboard")
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message || "Invalid email or password. Please try again."

    toast.error("Login failed", {
      description: errorMessage.value,
    })

    // trigger shake animation
    shakeError.value = false
    await nextTick()
    shakeError.value = true
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
          <FormControl>
            <div class="relative">
              <Input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="h-11 rounded-xl pr-10"
                v-bind="componentField"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm text-foreground">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
          >
          Remember Me
        </label>
        <NuxtLink
          to="/forgot-password"
          class="text-sm font-medium text-teal-600 hover:text-teal-500"
        >
          Forgot Your Password?
        </NuxtLink>
      </div>

      <Transition name="fade-slide">
        <p v-if="errorMessage" class="text-sm text-destructive text-center">
          {{ errorMessage }}
        </p>
      </Transition>

      <Button
        type="submit"
        class="h-11 w-full rounded-xl text-base font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
        style="background: linear-gradient(135deg, #1c7a6e 0%, #3fa0a0 100%);"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Signing in..." : "Log In" }}
      </Button>

      <div class="flex items-center gap-3 py-1">
        <div class="h-px flex-1 bg-border" />
        <span class="text-xs text-muted-foreground">Or Login With</span>
        <div class="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        class="h-11 w-full rounded-xl font-medium text-foreground transition-all duration-150 hover:bg-accent active:scale-[0.98]"
        @click="loginWithGoogle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38Z" />
        </svg>
        Google
      </Button>

      <p class="text-center text-sm text-muted-foreground">
        Don't Have An Account?
        <NuxtLink to="/register" class="font-medium text-teal-600 hover:text-teal-500">
          Register Now.
        </NuxtLink>
      </p>
    </Form>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out both;
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>