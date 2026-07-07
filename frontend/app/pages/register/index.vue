<script setup>
import { ref, computed } from "vue"

const name = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const touched = ref(false)

const passwordsMatch = computed(() => password.value === confirmPassword.value)

function handleSubmit() {
  touched.value = true
  if (!passwordsMatch.value) return
  // handle registration here
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-black px-4">
    <div class="w-full max-w-sm rounded-xl border border-white/10 bg-neutral-950 p-6 shadow-lg">

      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h1 class="text-lg font-semibold text-white">Create an account</h1>
          <p class="text-sm text-neutral-400 mt-1">
            Enter your details below to create your account
          </p>
        </div>
        <button type="button" class="text-sm text-neutral-300 hover:underline shrink-0">
          Login
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
        <!-- Full name -->
        <div class="grid gap-1.5">
          <label for="name" class="text-sm font-medium text-white">Full name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Ada Lovelace"
            required
            class="w-full rounded-md border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
          />
        </div>

        <!-- Email -->
        <div class="grid gap-1.5">
          <label for="email" class="text-sm font-medium text-white">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="m@example.com"
            required
            class="w-full rounded-md border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
          />
        </div>

        <!-- Password -->
        <div class="grid gap-1.5">
          <label for="password" class="text-sm font-medium text-white">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full rounded-md border border-white/15 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20"
          />
        </div>

        <!-- Confirm password -->
        <div class="grid gap-1.5">
          <label for="confirm-password" class="text-sm font-medium text-white">Confirm password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            required
            :aria-invalid="touched && !passwordsMatch"
            class="w-full rounded-md border bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:ring-1"
            :class="touched && !passwordsMatch
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : 'border-white/15 focus:border-white/40 focus:ring-white/20'"
          />
          <p v-if="touched && !passwordsMatch" class="text-sm text-red-500">
            Passwords do not match.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2 mt-2">
          <button
            type="submit"
            class="w-full rounded-md bg-white text-black text-sm font-medium py-2 hover:bg-neutral-200 transition-colors"
          >
            Create account
          </button>
          <button
            type="button"
            class="w-full rounded-md border border-white/15 text-white text-sm font-medium py-2 hover:bg-white/5 transition-colors"
          >
            Sign up with Google
          </button>
        </div>
      </form>
    </div>
  </div>
</template>