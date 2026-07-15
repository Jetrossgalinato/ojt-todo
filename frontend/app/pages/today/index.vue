<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useTasks } from "~/composables/useTasks"
import { useAuthStore } from "~/stores/auth.store"
import type { Task, TodayStats, TaskForm } from "~/types/tasks.type"
import TaskTable from "~/pages/dashboard/components/TaskTable.vue"
import TaskDialog from "~/pages/dashboard/components/TaskDialog.vue"

const { fetchToday, fetchTodayStats, createTask, updateTask, deleteTask: apiDeleteTask, toggleComplete: apiToggle } = useTasks()
const authStore = useAuthStore()

const tasks = ref<Task[]>([])
const stats = ref<TodayStats>({ todayTotal: 0, todayCompleted: 0, todayRemaining: 0, overdue: 0 })
const loading = ref(true)
const errorMsg = ref("")

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref<TaskForm>({ title: "", description: "", dueDate: "", dueTime: "", priority: "medium", listId: "", tags: "" })

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

onMounted(async () => {
  if (!authStore.accessToken) return navigateTo("/login")
  try {
    const [t, s] = await Promise.all([fetchToday(), fetchTodayStats()])
    tasks.value = t
    stats.value = s
  } catch (err: any) {
    console.error("Failed to load today tasks:", err)
    errorMsg.value = err?.data?.message || err?.message || "Failed to load tasks"
  } finally {
    loading.value = false
  }
})

function openAddDialog() {
  editingId.value = null
  form.value = { title: "", description: "", dueDate: getToday(), dueTime: "", priority: "medium", listId: "", tags: "" }
  dialogOpen.value = true
}

function resetForm() {
  editingId.value = null
  dialogOpen.value = false
  form.value = { title: "", description: "", dueDate: "", dueTime: "", priority: "medium", listId: "", tags: "" }
}

function editTask(task: Task) {
  editingId.value = task.id
  dialogOpen.value = true
  form.value = {
    title: task.title,
    description: task.description ?? "",
    dueDate: task.dueDate ?? "",
    dueTime: task.dueTime ?? "",
    priority: task.priority,
    listId: task.listId ?? "",
    tags: task.tags.map((t) => t.name).join(", "),
  }
}

async function saveTask() {
  if (!form.value.title.trim()) return
  try {
    if (editingId.value) {
      const updated = await updateTask(editingId.value, form.value)
      const task = tasks.value.find((t) => t.id === editingId.value)
      if (task) Object.assign(task, updated)
    } else {
      const created = await createTask(form.value)
      tasks.value.unshift(created)
    }
    resetForm()
    stats.value = await fetchTodayStats()
  } catch (err) {
    console.error("Failed to save task:", err)
  }
}

async function deleteTask(id: string) {
  try {
    await apiDeleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
    stats.value = await fetchTodayStats()
  } catch (err) {
    console.error("Failed to delete task:", err)
  }
}

async function toggleComplete(id: string) {
  try {
    const updated = await apiToggle(id)
    if (updated.status === "completed") {
      tasks.value = tasks.value.filter((t) => t.id !== id)
    }
    stats.value = await fetchTodayStats()
  } catch (err) {
    console.error("Failed to update task:", err)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between animate-card-in stagger-1">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Today</h1>
        <p class="text-sm text-muted-foreground mt-1">Tasks due today + overdue</p>
      </div>
      <Button
        @click="openAddDialog"
        class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 animate-btn-press"
      >
        + Add Task
      </Button>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="(stat, i) in [
        { label: 'Total', value: stats.todayTotal, color: 'text-foreground' },
        { label: 'Remaining', value: stats.todayRemaining, color: 'text-amber-600' },
        { label: 'Done', value: stats.todayCompleted, color: 'text-emerald-600' },
        { label: 'Overdue', value: stats.overdue, color: 'text-rose-600' },
      ]" :key="stat.label" class="animate-card-in" :class="`stagger-${i + 2}`">
        <div class="rounded-xl border border-border bg-white p-4 shadow-sm">
          <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
          <p class="text-2xl font-bold" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <TaskDialog
      v-model:open="dialogOpen"
      v-model:form="form"
      :editing-id="editingId"
      @save="saveTask"
      @cancel="resetForm"
    />

    <div v-if="loading" class="text-center py-10 text-sm text-muted-foreground">Loading...</div>

    <div v-else-if="errorMsg" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ errorMsg }}
    </div>

    <template v-else>
      <TaskTable
        :tasks="tasks"
        @edit="editTask"
        @delete="deleteTask"
        @toggle="toggleComplete"
      />

      <div v-if="tasks.length === 0" class="rounded-2xl border border-dashed border-border py-16 text-center">
        <p class="text-sm text-muted-foreground mb-2">No tasks due today</p>
        <p class="text-xs text-muted-foreground mb-4">Tasks with today's date or overdue dates will appear here.</p>
        <Button
          @click="openAddDialog"
          class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0"
        >
          + Add a Task for Today
        </Button>
      </div>
    </template>
  </div>
</template>
