<script setup lang="ts">
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import { useAuth } from "@/composables/useAuth"

const { forgotPassword } = useAuth()

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email address"),
  })
)

const { handleSubmit } = useForm({
  validationSchema: formSchema,
})

const isSubmitted = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref("")

const onSubmit = handleSubmit(async (values) => {
  errorMessage.value = ""
  isSubmitting.value = true

  try {
    await forgotPassword(values.email)
    isSubmitted.value = true
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message || "Something went wrong. Please try again."
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
      <!-- Success state -->
      <div v-if="isSubmitted" class="flex flex-col gap-4 text-center">
        <h1 class="text-lg font-semibold text-foreground">Check your email</h1>
        <p class="text-sm text-muted-foreground">
          If an account exists for that email, we've sent a link to reset your password.
        </p>
        <NuxtLink to="/login" class="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
          Back to login
        </NuxtLink>
      </div>

      <!-- Form state -->
      <div v-else>
        <div class="mb-6">
          <h1 class="text-lg font-semibold text-foreground">Forgot password?</h1>
          <p class="text-sm text-muted-foreground mt-1">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form class="flex flex-col gap-5" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="m@example.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <p v-if="errorMessage" class="text-sm text-destructive text-center">
            {{ errorMessage }}
          </p>

          <Button type="submit" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? "Sending..." : "Send reset link" }}
          </Button>

          <NuxtLink to="/login" class="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 text-center">
            Back to login
          </NuxtLink>
        </form>
      </div>
    </div>
  </div>
</template>