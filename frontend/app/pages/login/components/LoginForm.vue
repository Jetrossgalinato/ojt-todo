<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { toast } from "vue-sonner"
import * as z from "zod"
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

async function onSubmit(values: Record<string, any>) {
  isSubmitting.value = true

  try {
    const response = await login(values.email, values.password)
    authStore.setAuth(response.accessToken, response.user)
    toast.success("Signed in successfully")
    await navigateTo("/dashboard")
  } catch (error: unknown) {
    toast.error(
      getApiErrorMessage(error, "Invalid email or password. Please try again.")
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Form :validation-schema="formSchema" @submit="onSubmit" class="flex flex-col gap-6">
    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <Label for="email">Email</Label>
        <FormControl>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <div class="flex items-center justify-between">
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

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? "Signing in..." : "Sign in" }}
    </Button>

    <p class="text-center text-sm text-muted-foreground">
      Don't have an account?
      <NuxtLink to="/register" class="font-medium text-foreground underline underline-offset-4">
        Sign up
      </NuxtLink>
    </p>
  </Form>
</template>
