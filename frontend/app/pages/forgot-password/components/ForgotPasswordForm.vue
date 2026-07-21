<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import { toast } from "vue-sonner"
import { useAuth } from "@/composables/useAuth"
import { getApiErrorMessage } from "@/lib/get-api-error"

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email address"),
  })
)

const { forgotPassword } = useAuth()

const isSubmitted = ref(false)
const isSubmitting = ref(false)

async function onSubmit(values: Record<string, any>) {
  isSubmitting.value = true

  try {
    await forgotPassword(values.email)
    isSubmitted.value = true
    toast.success("If an account exists, a reset link has been sent to your email.")
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Something went wrong. Please try again."))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="w-full animate-fade-in-up">
    <!-- Success state -->
    <div v-if="isSubmitted" class="flex flex-col items-center gap-4 text-center">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">
        Check your email
      </h1>
      <p class="text-sm text-muted-foreground">
        If an account exists for that email, we've sent a link to reset your password.
      </p>
      <NuxtLink
        to="/login"
        class="mt-2 text-sm font-medium text-teal-600 hover:text-teal-500"
      >
        Back to login
      </NuxtLink>
    </div>

    <!-- Form state -->
    <div v-else>
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">
          Forgot Password?
        </h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <Form
        :validation-schema="formSchema"
        class="flex flex-col gap-5"
        @submit="onSubmit"
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

        <Button
          type="submit"
          class="h-11 w-full rounded-xl text-base font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
          style="background: linear-gradient(135deg, #1c7a6e 0%, #3fa0a0 100%);"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Sending..." : "Send reset link" }}
        </Button>

        <p class="text-center text-sm text-muted-foreground">
          Remember your password?
          <NuxtLink to="/login" class="font-medium text-teal-600 hover:text-teal-500">
            Back to login
          </NuxtLink>
        </p>
      </Form>
    </div>
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
</style>
