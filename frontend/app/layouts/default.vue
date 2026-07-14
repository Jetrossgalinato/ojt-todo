<script setup lang="ts">
import { ClipboardList, CheckSquare, Calendar, Clock, CheckCircle2, Settings, LogOut } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { label: 'My Tasks', to: '/dashboard', icon: CheckSquare },
  { label: 'Today', to: '/today', icon: Clock },
  { label: 'Upcoming', to: '/upcoming', icon: Calendar },
  { label: 'Completed', to: '/completed', icon: CheckCircle2 },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function isActive(path: string) {
  return route.path === path
}

function handleLogout() {
  authStore.logout?.()
  navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <aside class="w-56 bg-teal-800 text-white flex flex-col py-6 px-4">
      <div class="flex items-center gap-2 px-2 mb-8">
        <ClipboardList class="w-6 h-6" />
        <span class="text-lg font-bold">Todo</span>
      </div>

      <nav class="flex flex-col gap-1 flex-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.to)
            ? 'bg-white text-teal-800'
            : 'text-teal-100 hover:bg-teal-700'"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <button
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-teal-100 hover:bg-teal-700 transition-colors"
        @click="handleLogout"
      >
        <LogOut class="w-4 h-4" />
        Logout
      </button>
    </aside>

    <main class="flex-1 p-8">
      <slot />
    </main>
  </div>
</template>