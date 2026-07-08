<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
)

const errorMessage = ref("")
const isSubmitting = ref(false)

async function onSubmit(values: Record<string, any>) {
  errorMessage.value = ""
  isSubmitting.value = true

  try {
    const response = await $fetch<{
      accessToken: string
      user: { id: string; email: string; name: string | null }
    }>("http://localhost:4000/auth/login", {
      method: "POST",
      body: {
        email: values.email,
        password: values.password,
      },
    })

    // I-store ang token para magamit sa sunod nga requests
    const token = useCookie("accessToken", { maxAge: 60 * 60 * 24 }) // 1 day
    token.value = response.accessToken

    navigateTo("/dashboard")
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message || "Invalid email or password. Please try again."
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
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot your password?
          </NuxtLink>
        </div>
        <FormControl>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            v-bind="componentField"
          />
        </FormControl>
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
      <NuxtLink to="/register" class="font-medium text-foreground underline underline-offset-4">
        Sign up
      </NuxtLink>
    </p>
  </Form>
</template>