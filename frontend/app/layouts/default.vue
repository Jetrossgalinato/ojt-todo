<script setup lang="ts">
import { ClipboardList, CheckSquare, Settings, LogOut } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { label: 'My Tasks', to: '/dashboard', icon: CheckSquare },
  { label: 'Settings', to: '/settings', icon: Settings },
]

function isActive(path: string) {
  return route.path === path
}

function handleLogout() {
  authStore.logout?.()
  toast.success('Signed out successfully')
  navigateTo('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
    <aside class="w-56 bg-teal-800 dark:bg-zinc-900 text-white flex flex-col py-6 px-4">
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
            ? 'bg-white text-teal-800 dark:bg-teal-600 dark:text-white'
            : 'text-teal-100 hover:bg-teal-700 dark:text-zinc-300 dark:hover:bg-zinc-800'"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="mt-auto flex flex-col gap-1">
        <ClientOnly>
          <ThemeSwitcher />
        </ClientOnly>

        <button
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-teal-100 hover:bg-teal-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          @click="handleLogout"
        >
          <LogOut class="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>

    <main class="flex-1 p-8">
      <slot />
    </main>
  </div>
</template>