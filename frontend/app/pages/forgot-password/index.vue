<script setup lang="ts">
import { ref, nextTick } from "vue"
import { useForm, Field as FormField, ErrorMessage as FormMessage } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { toast } from "vue-sonner"
import * as z from "zod"
import { useAuth } from "@/composables/useAuth"
import { getApiErrorMessage } from "@/lib/get-api-error"


const { forgotPassword } = useAuth()

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email address"),
  })
)

const { handleSubmit } = useForm({ validationSchema: formSchema })

const isSubmitted = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref("")
const shakeError = ref(false)

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    await forgotPassword(values.email)
    isSubmitted.value = true
  } catch (error: any) {
    errorMessage.value = error?.data?.message || "Something went wrong. Please try again."
    // trigger shake animation
    shakeError.value = false
    await nextTick()
    shakeError.value = true
  } finally {
    isSubmitting.value = false
  }
})

definePageMeta({ layout: false })
</script>

<template>
  <div class="grid min-h-screen w-full lg:grid-cols-2">
    <!-- LEFT: Forgot password form -->
    <div class="relative flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-20">
      <img src="/images/logo-todo.png" alt="Todo logo"
        class="absolute left-6 top-6 h-22 w-auto object-contain sm:left-12 sm:top-12 lg:left-20 lg:top-12" />

      <div class="w-full max-w-md animate-fade-in-up">
        <!-- Success state -->
        <div v-if="isSubmitted" class="flex flex-col gap-4 text-center">
          <h1 class="text-3xl font-bold tracking-tight text-foreground">Check your email</h1>
          <p class="text-sm text-muted-foreground">
            If an account exists for that email, we've sent a link to reset your password.
          </p>
          <NuxtLink
            to="/login"
            class="text-sm font-medium text-teal-600 hover:text-teal-500 underline underline-offset-4"
          >
            Back to login
          </NuxtLink>
        </div>

        <!-- Form state -->
        <form
          v-else
          class="flex flex-col gap-5"
          :class="{ 'animate-shake': shakeError }"
          @submit.prevent="onSubmit"
          @animationend="shakeError = false"
        >
          <div class="mb-8 text-center">
            <h1 class="text-3xl font-bold tracking-tight text-foreground">Forgot Password?</h1>
            <p class="mt-2 text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

         <FormField name="email" v-slot="{ componentField }">
  <FormItem>
    <FormLabel>Email</FormLabel>
    <FormControl>
      <Input
        type="email"
        placeholder="you@example.com"
        class="h-11 rounded-xl"
        v-bind="componentField"
      />
    </FormControl>
  </FormItem>
</FormField>


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
            {{ isSubmitting ? "Sending..." : "Send reset link" }}
          </Button>

          <NuxtLink
            to="/login"
            class="text-sm font-medium text-teal-600 hover:text-teal-500 text-center"
          >
            Back to login
          </NuxtLink>
        </form>
      </div>
    </div>

    <!-- RIGHT: Gradient + Illustration -->
    <div class="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center"
         style="background: linear-gradient(135deg, #1e5a7a 0%, #1c7a6e 45%, #3fa0a0 100%);">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute -top-16 right-0 h-72 w-72 rounded-full opacity-90 blur-md"
             style="background: radial-gradient(circle at 30% 30%, #d4e157, #7cb342 70%);" />
        <div class="absolute top-1/4 left-1/3 h-96 w-96 rounded-full opacity-60 blur-lg"
             style="background: radial-gradient(circle at 50% 50%, #4fd1c5, #2b8a99 70%);" />
        <div class="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/4 translate-y-1/4 rounded-full opacity-90 blur-md"
             style="background: radial-gradient(circle at 40% 40%, #cddc39, #8bc34a 70%);" />
        <div class="absolute bottom-10 right-10 h-64 w-64 rounded-full opacity-80 blur-md"
             style="background: radial-gradient(circle at 40% 40%, #aee571, #5fae5a 70%);" />
      </div>

      <div class="relative z-10 flex flex-1 items-center justify-center px-10">
        <img src="/images/illustration.png"
             alt="Reset your password and get back on track."
             class="w-full max-w-xl object-contain" />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
.animate-shake { animation: shake 0.4s ease-in-out; }

.fade-slide-enter-active,
.fade-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-slide-enter-from,
.fade-slide-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
