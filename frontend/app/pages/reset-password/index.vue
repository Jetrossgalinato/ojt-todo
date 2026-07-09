<script setup lang="ts">
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import { useAuth } from "@/composables/useAuth"

const route = useRoute()
const token = route.query.token as string | undefined
const { resetPassword } = useAuth()

const formSchema = toTypedSchema(
  z
    .object({
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
)

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const isSuccess = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref("")

const onSubmit = handleSubmit(async (values) => {
  if (!token) {
    errorMessage.value = "Invalid or missing reset token."
    return
  }

  errorMessage.value = ""
  isSubmitting.value = true

  try {
    await resetPassword(token, values.password)
    isSuccess.value = true
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message || "This reset link is invalid or has expired."
  } finally {
    isSubmitting.value = false
  }
})
</script>


<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">

      <!-- No token -->
      <div v-if="!token" class="flex flex-col gap-4 text-center">
        <h1 class="text-lg font-semibold text-foreground">Invalid link</h1>
        <p class="text-sm text-muted-foreground">
          This password reset link is invalid or has expired.
        </p>
        <Button variant="link" class="text-sm" @click="navigateTo('/forgot-password')">
          Request a new link
        </Button>
      </div>

      <!-- Success state -->
      <div v-else-if="isSuccess" class="flex flex-col gap-4 text-center">
        <h1 class="text-lg font-semibold text-foreground">Password reset</h1>
        <p class="text-sm text-muted-foreground">
          Your password has been successfully reset.
        </p>
       <NuxtLink to="/login">
  <Button class="w-full">
    Go to login
  </Button>
</NuxtLink>
      </div>

      <!-- Form state -->
      <div v-else>
        <div class="mb-6">
          <h1 class="text-lg font-semibold text-foreground">Reset password</h1>
          <p class="text-sm text-muted-foreground mt-1">
            Enter your new password below.
          </p>
        </div>

        <form class="flex flex-col gap-5" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type="password" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <p v-if="errorMessage" class="text-sm text-destructive text-center">
            {{ errorMessage }}
          </p>

          <Button type="submit" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? "Resetting..." : "Reset password" }}
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>