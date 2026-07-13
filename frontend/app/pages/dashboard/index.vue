<script setup lang="ts">
import { ref, computed } from "vue"
import type { Task, TaskForm } from "~/type/tasks.type"
import TaskDialog from "./components/TaskDialog.vue"
import TaskTable from "./components/TaskTable.vue"

const lists = ["Personal", "Work", "Errands"]

const tasks = ref<Task[]>([])

const pendingCount = computed(() => tasks.value.filter((t) => !t.completed).length)

const dialogOpen = ref(false)
const editingId = ref<number | null>(null)

const form = ref<TaskForm>({
  title: "",
  description: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
  tags: "",
  list: lists[0]!,
})

function openAddDialog() {
  editingId.value = null
  form.value = {
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    tags: "",
    list: lists[0]!,
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
    tags: "",
    list: lists[0]!,
  }
}

function editTask(task: Task) {
  editingId.value = task.id
  dialogOpen.value = true
  form.value = {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    priority: task.priority,
    tags: task.tags,
    list: task.list,
  }
}

function saveTask() {
  if (!form.value.title.trim()) return

  if (editingId.value) {
    const task = tasks.value.find((t) => t.id === editingId.value)
    if (task) Object.assign(task, form.value)
  } else {
    tasks.value.unshift({
      ...form.value,
      id: Date.now(),
      completed: false,
    })
  }
  resetForm()
}

function deleteTask(id: number) {
  tasks.value = tasks.value.filter((t) => t.id !== id)
}

function toggleComplete(id: number) {
  const task = tasks.value.find((t) => t.id === id)
  if (task) task.completed = !task.completed
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ pendingCount }} tasks pending</p>
      </div>
      <Button @click="openAddDialog">+ Add Task</Button>
    </div>

    <!-- Add / Edit Task Dialog -->
    <TaskDialog
      v-model:open="dialogOpen"
      v-model:form="form"
      :editing-id="editingId"
      :lists="lists"
      @save="saveTask"
      @cancel="resetForm"
    />

    <!-- Task list -->
    <TaskTable
      :tasks="tasks"
      @edit="editTask"
      @delete="deleteTask"
      @toggle="toggleComplete"
    />
  </div>
</template>