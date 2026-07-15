<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useAuthStore } from "~/stores/auth.store"
import { useTasks } from "~/composables/useTasks"
import type { Task, TaskForm } from "~/types/tasks.type"
import TaskDialog from "./components/TaskDialog.vue"
import TaskTable from "./components/TaskTable.vue"

const { fetchTasks, createTask, updateTask, deleteTask: apiDeleteTask, toggleComplete: apiToggle } = useTasks()
const authStore = useAuthStore()

const tasks = ref<Task[]>([])

onMounted(async () => {
  try {
    tasks.value = await fetchTasks()
  } catch (err) {
    console.error("Failed to load tasks:", err)
  }
})

const pendingCount = computed(() => tasks.value.filter((t) => t.status === "pending").length)

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)

const form = ref<TaskForm>({
  title: "",
  description: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
  listId: "",
  tags: "",
})

function handleAddClick() {
  if (!authStore.accessToken) return navigateTo("/login")
  openAddDialog()
}

function openAddDialog() {
  editingId.value = null
  form.value = {
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "",
    priority: "medium",
    listId: "",
    tags: "",
  }
  dialogOpen.value = true
}

function resetForm() {
  editingId.value = null
  dialogOpen.value = false
  form.value = {
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    listId: "",
    tags: "",
  }
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

  if (!authStore.accessToken) {
    return navigateTo("/login")
  }

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
  } catch (err) {
    console.error("Failed to save task:", err)
  }
}

async function deleteTask(id: string) {
  try {
    await apiDeleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  } catch (err) {
    console.error("Failed to delete task:", err)
  }
}

async function toggleComplete(id: string) {
  try {
    const updated = await apiToggle(id)
    const task = tasks.value.find((t) => t.id === id)
    if (task) Object.assign(task, updated)
  } catch (err) {
    console.error("Failed to update task:", err)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between animate-card-in stagger-1">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ pendingCount }} tasks pending</p>
      </div>
      <Button
        @click="handleAddClick"
        class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 animate-btn-press"
      >
        + Add Task
      </Button>
    </div>

    <TaskDialog
      v-model:open="dialogOpen"
      v-model:form="form"
      :editing-id="editingId"
      @save="saveTask"
      @cancel="resetForm"
    />

    <TaskTable
      :tasks="tasks"
      @edit="editTask"
      @delete="deleteTask"
      @toggle="toggleComplete"
    />
  </div>
</template>
