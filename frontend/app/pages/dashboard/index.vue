<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { toast } from "vue-sonner"
import { useTasks } from "~/composables/useTasks"
import { useTags, type Tag } from "~/composables/useTags"
import { getApiErrorMessage } from "~/lib/get-api-error"
import { tagsToFormInput } from "~/lib/tags"
import type { Task, TaskForm } from "~/types/tasks.type"
import TagFilter from "~/components/TagFilter.vue"
import TaskDialog from "./components/TaskDialog.vue"
import TaskTable from "./components/TaskTable.vue"

const { fetchTasks, createTask, updateTask, deleteTask: apiDeleteTask } = useTasks()
const { fetchTags } = useTags()
const authStore = useAuthStore()

const lists = ["Personal", "Work", "Errands"]
const defaultList = lists[0] ?? "Personal"

const tasks = ref<Task[]>([])
const tags = ref<Tag[]>([])
const selectedTag = ref<string | null>(null)

const filteredTasks = computed(() => {
  if (!selectedTag.value) return tasks.value
  return tasks.value.filter((t) =>
    t.tags.some((tag) => tag.name === selectedTag.value),
  )
})

onMounted(async () => {
  try {
    const [fetchedTasks, fetchedTags] = await Promise.all([
      fetchTasks(),
      fetchTags().catch(() => []),
    ])
    tasks.value = fetchedTasks
    tags.value = fetchedTags
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to load tasks."))
  }
})

const pendingCount = computed(() => tasks.value.filter((t) => !t.completed).length)

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)

const form = ref<TaskForm>({
  title: "",
  description: "",
  startDate: "",
  startTime: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
  tags: "",
  list: defaultList,
})

function handleAddClick() {
  if (!authStore.accessToken) return navigateTo("/login")
  openAddDialog()
}

function openAddDialog() {
  editingId.value = null
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const currentTime = now.toTimeString().slice(0, 5)
  form.value = {
    title: "",
    description: "",
    startDate: today,
    startTime: currentTime,
    dueDate: "",
    dueTime: "",
    priority: "medium",
    tags: "",
    list: defaultList,
  }
  dialogOpen.value = true
}

function resetForm() {
  editingId.value = null
  dialogOpen.value = false
  form.value = {
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    tags: "",
    list: defaultList,
  }
}

function editTask(task: Task) {
  editingId.value = task.id
  dialogOpen.value = true
  form.value = {
    title: task.title,
    description: task.description,
    startDate: task.startDate,
    startTime: task.startTime,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    priority: task.priority,
    tags: tagsToFormInput(task.tags),
    list: task.list,
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
      toast.success("Task updated")
    } else {
      const created = await createTask(form.value)
      tasks.value.unshift(created)
      toast.success("Task created")
    }
    resetForm()
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to save task."))
  }
}

async function deleteTask(id: string) {
  try {
    await apiDeleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
    toast.success("Task deleted")
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to delete task."))
  }
}

async function toggleComplete(id: string) {
  const task = tasks.value.find((t) => t.id === id)
  if (!task) return

  try {
    const updated = await apiToggleComplete(id)
    Object.assign(task, updated)
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to update task."))
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ pendingCount }} tasks pending</p>
      </div>
      <Button
  @click="handleAddClick"
  class="rounded-full px-4 py-1.5 text-xs h-auto bg-primary hover:bg-primary/90 text-primary-foreground border-0 self-start sm:self-auto"
>
  + Add Task
</Button>
    </div>

    <TagFilter v-if="tags.length > 0" v-model:selected-tag="selectedTag" :tags="tags" />

    <TaskDialog
      v-model:open="dialogOpen"
      v-model:form="form"
      :editing-id="editingId"
      :lists="lists"
      @save="saveTask"
      @cancel="resetForm"
    />

    <TaskTable
      :tasks="filteredTasks"
      @edit="editTask"
      @delete="deleteTask"
      @toggle="toggleComplete"
    />
  </div>
</template>
