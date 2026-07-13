<template>
  <aside class="w-64 min-h-screen bg-teal-800 text-white p-4 flex flex-col rounded-r-3xl">
    <!-- Logo -->
    <div class="flex items-center gap-2 mb-8 px-2">
      <ClipboardCheck class="w-6 h-6" />
      <span class="font-semibold text-lg">Todo</span>
    </div>

    <!-- Navigation -->
    <nav class="flex flex-col gap-1">
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
        :class="isActive('/dashboard') ? 'bg-white/20 font-medium' : 'hover:bg-white/10 opacity-80'"
      >
        <CheckSquare class="w-5 h-5" />
        My Tasks
      </NuxtLink>

      <NuxtLink
        to="/dashboard/today"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
        :class="isActive('/dashboard/today') ? 'bg-white/20 font-medium' : 'hover:bg-white/10 opacity-80'"
      >
        <Calendar class="w-5 h-5" />
        Today
      </NuxtLink>

      <NuxtLink
        to="/dashboard/upcoming"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
        :class="isActive('/dashboard/upcoming') ? 'bg-white/20 font-medium' : 'hover:bg-white/10 opacity-80'"
      >
        <Clock class="w-5 h-5" />
        Upcoming
      </NuxtLink>

      <NuxtLink
        to="/dashboard/completed"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
        :class="isActive('/dashboard/completed') ? 'bg-white/20 font-medium' : 'hover:bg-white/10 opacity-80'"
      >
        <CheckCircle class="w-5 h-5" />
        Completed
      </NuxtLink>

      <NuxtLink
        to="/dashboard/settings"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
        :class="isActive('/dashboard/settings') ? 'bg-white/20 font-medium' : 'hover:bg-white/10 opacity-80'"
      >
        <Settings class="w-5 h-5" />
        Settings
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup>
import {
  ClipboardCheck,
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle,
  Settings
} from 'lucide-vue-next'

const route = useRoute()

const isActive = (path) => route.path === path
</script>