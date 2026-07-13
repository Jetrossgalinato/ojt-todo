<script setup lang="ts">
import LoginForm from "./components/LoginForm.vue"

// Full-screen split layout — bypass the default Navbar layout
definePageMeta({
  layout: false,
})
</script>

<template>
  <div class="grid min-h-screen w-full lg:grid-cols-2">
    <!-- LEFT: Login form panel -->
    <div class="relative flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-20">
      <img
        src="/images/logo-todo.png"
        alt="Todo logo"
        class="absolute left-6 top-6 h-22 w-auto object-contain sm:left-12 sm:top-12 lg:left-20 lg:top-12"
      >

      <div class="w-full max-w-md">
        <LoginForm />
      </div>
    </div>

    <!-- RIGHT: Brand / Illustration panel -->
    <div
      class="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center"
      style="background: linear-gradient(135deg, #1e5a7a 0%, #1c7a6e 45%, #3fa0a0 100%);"
    >
      <!-- Decorative gradient blobs -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-16 right-0 h-72 w-72 rounded-full opacity-90 blur-md"
          style="background: radial-gradient(circle at 30% 30%, #d4e157, #7cb342 70%);"
        />
        <div
          class="absolute top-1/4 left-1/3 h-96 w-96 rounded-full opacity-60 blur-lg"
          style="background: radial-gradient(circle at 50% 50%, #4fd1c5, #2b8a99 70%);"
        />
        <div
          class="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/4 translate-y-1/4 rounded-full opacity-90 blur-md"
          style="background: radial-gradient(circle at 40% 40%, #cddc39, #8bc34a 70%);"
        />
        <div
          class="absolute bottom-10 right-10 h-64 w-64 rounded-full opacity-80 blur-md"
          style="background: radial-gradient(circle at 40% 40%, #aee571, #5fae5a 70%);"
        />
      </div>

    

      <!-- Illustration (transparent background, overlays the blobs) -->
      <div class="relative z-10 flex flex-1 items-center justify-center px-10">
        <img
          src="/images/illustration.png"
          alt="Plan your day, manage your tasks, and never miss an important deadline."
          class="w-full max-w-xl object-contain"
        >
      </div>

      
    </div>
  </div>
</template>