<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useTasks } from "~/composables/useTasks"
import { useAuthStore } from "~/stores/auth.store"
import type { Task, PaginatedResult } from "~/types/tasks.type"

const { fetchCompleted, deleteTask: apiDeleteTask } = useTasks()
const authStore = useAuthStore()

const result = ref<PaginatedResult<Task>>({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 })
const loading = ref(true)
const errorMsg = ref("")
const dateFrom = ref("")
const dateTo = ref("")

onMounted(async () => {
  if (!authStore.accessToken) return navigateTo("/login")
  await loadCompleted()
})

async function loadCompleted(page = 1) {
  loading.value = true
  errorMsg.value = ""
  try {
    result.value = await fetchCompleted({
      from: dateFrom.value || undefined,
      to: dateTo.value || undefined,
      page,
      limit: 20,
    })
  } catch (err: any) {
    console.error("Failed to load completed tasks:", err)
    errorMsg.value = err?.data?.message || err?.message || "Failed to load tasks"
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  loadCompleted(1)
}

async function deleteTask(id: string) {
  try {
    await apiDeleteTask(id)
    result.value.data = result.value.data.filter((t) => t.id !== id)
    result.value.total--
  } catch (err) {
    console.error("Failed to delete task:", err)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between animate-card-in stagger-1">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Completed</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ result.total }} tasks completed</p>
      </div>
    </div>

    <div class="flex flex-wrap items-end gap-3 animate-card-in stagger-2">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-muted-foreground">From</label>
        <input
          v-model="dateFrom"
          type="date"
          class="rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
        >
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-muted-foreground">To</label>
        <input
          v-model="dateTo"
          type="date"
          class="rounded-lg border border-border bg-white px-3 py-1.5 text-sm"
        >
      </div>
      <Button
        @click="applyFilter"
        class="rounded-lg px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 animate-btn-press"
      >
        Filter
      </Button>
      <Button
        v-if="dateFrom || dateTo"
        variant="ghost"
        size="sm"
        @click="dateFrom = ''; dateTo = ''; loadCompleted(1)"
        class="text-xs h-auto animate-btn-press"
      >
        Clear
      </Button>
    </div>

    <div v-if="loading" class="text-center py-10 text-sm text-muted-foreground">Loading...</div>

    <div v-else-if="errorMsg" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ errorMsg }}
    </div>

    <template v-else>
      <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div class="divide-y divide-border">
          <div v-for="(task, index) in result.data" :key="task.id" class="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 animate-card-in" :class="`stagger-${Math.min(index + 3, 8)}`">
            <div class="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
              <svg class="w-3 h-3 text-emerald-600 animate-checkbox" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground line-through text-muted-foreground truncate">{{ task.title }}</p>
              <p v-if="task.description" class="text-xs text-muted-foreground truncate">{{ task.description }}</p>
            </div>
            <span class="text-xs text-muted-foreground whitespace-nowrap">
              Done {{ task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "" }}
            </span>
            <Button
              variant="ghost"
              size="sm"
              class="rounded-lg text-xs text-destructive hover:text-destructive animate-btn-press"
              @click="deleteTask(task.id)"
            >
              Delete
            </Button>
          </div>

          <div v-if="result.data.length === 0" class="py-10 text-center text-sm text-muted-foreground">
            No completed tasks found
          </div>
        </div>
      </div>

      <div v-if="result.totalPages > 1" class="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="result.page <= 1"
          @click="loadCompleted(result.page - 1)"
          class="rounded-lg text-xs"
        >
          Previous
        </Button>
        <span class="text-xs text-muted-foreground">
          Page {{ result.page }} of {{ result.totalPages }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="result.page >= result.totalPages"
          @click="loadCompleted(result.page + 1)"
          class="rounded-lg text-xs"
        >
          Next
        </Button>
      </div>
    </template>
  </div>
</template>
