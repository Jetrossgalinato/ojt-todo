<script setup lang="ts">
import { ref } from "vue"
import { toast } from "vue-sonner"
import { LogOut } from "lucide-vue-next"

const searchQuery = ref("")
const router = useRouter()
const authStore = useAuthStore()

function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return
}

async function handleLogout() {
  try {
    authStore.logout()
    toast.success("Signed out successfully")
    await router.push("/login")
  } catch (error: unknown) {
    toast.error("Logout failed. Please try again.")
  }
}
</script>

<template>
  <nav
    class="flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-3 sm:px-8 sm:py-4"
  >
    <div class="flex items-center gap-4 sm:gap-8">
      <span class="text-lg font-bold text-foreground sm:text-xl">
        Todo
      </span>

      <div class="hidden items-center gap-6 sm:flex">
        <NuxtLink
          to="/dashboard"
          class="text-sm font-medium text-muted-foreground hover:text-foreground"
          active-class="text-foreground font-semibold"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/my-tasks"
          class="text-sm font-medium text-muted-foreground hover:text-foreground"
          active-class="text-foreground font-semibold"
        >
          My Tasks
        </NuxtLink>
      </div>
    </div>

    <div class="flex items-center gap-3 sm:gap-4">
      <Input
        type="text"
        v-model="searchQuery"
        placeholder="Search tasks..."
        class="w-32 sm:w-56"
        @keyup.enter="handleSearch"
      />

      <ModeToggle />

      <Button variant="ghost" size="icon" @click="handleLogout" title="Logout">
        <LogOut class="h-5 w-5" />
      </Button>
    </div>
  </nav>
</template>
