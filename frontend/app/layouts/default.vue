<script setup lang="ts">
import { ClipboardList, CheckSquare, Settings, LogOut, Menu, X } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

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

watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
    <!-- Mobile overlay backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-sidebar-primary py-6 px-4 text-sidebar-primary-foreground transition-transform duration-200 ease-in-out lg:static lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between px-2 mb-8">
        <div class="flex items-center gap-2">
          <ClipboardList class="w-6 h-6" />
          <span class="text-lg font-bold">Todo</span>
        </div>
        <button
          class="rounded-lg p-1 text-sidebar-primary-foreground/80 hover:bg-white/10 lg:hidden"
          @click="sidebarOpen = false"
        >
          <X class="w-5 h-5" />
        </button>
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

    <!-- Main content area -->
    <div class="flex flex-1 flex-col min-w-0">
      <!-- Mobile top bar -->
      <header class="flex items-center gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
        <button
          class="rounded-lg p-1.5 text-foreground hover:bg-muted transition-colors"
          @click="sidebarOpen = true"
        >
          <Menu class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2">
          <ClipboardList class="w-5 h-5 text-primary" />
          <span class="text-lg font-bold">Todo</span>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
