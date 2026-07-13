<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import { toast } from "vue-sonner"
import * as z from "zod"
import { useAuth } from "@/composables/useAuth"
import { getApiErrorMessage } from "@/lib/get-api-error"

const { register } = useAuth()

const formSchema = toTypedSchema(
  z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
)

const isSubmitting = ref(false)

async function onSubmit(values: Record<string, any>) {
  isSubmitting.value = true

  try {
    await register(values.fullName, values.email, values.password)
    toast.success("Account created", {
      description: "Your account has been registered. Please sign in to continue.",
    })
    await navigateTo("/login")
  } catch (error: unknown) {
    toast.error("Registration failed", {
      description: getApiErrorMessage(error, "Something went wrong. Please try again."),
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Form :validation-schema="formSchema" @submit="onSubmit" class="flex flex-col gap-6">
    <FormField v-slot="{ componentField }" name="fullName">
      <FormItem>
        <Label for="fullName">Full Name</Label>
        <FormControl>
          <Input
            id="fullName"
            type="text"
            placeholder="Juan Dela Cruz"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

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
        <Label for="password">Password</Label>
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

    <FormField v-slot="{ componentField }" name="confirmPassword">
      <FormItem>
        <Label for="confirmPassword">Confirm Password</Label>
        <FormControl>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            v-bind="componentField"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full" :disabled="isSubmitting">
      {{ isSubmitting ? "Creating account..." : "Sign up" }}
    </Button>

    <p class="text-center text-sm text-muted-foreground">
      Already have an account?
      <NuxtLink to="/login" class="font-medium text-foreground underline underline-offset-4">
        Sign in
      </NuxtLink>
    </p>
  </Form>
</template>