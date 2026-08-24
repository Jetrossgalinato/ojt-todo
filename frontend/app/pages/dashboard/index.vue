<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { toast } from "vue-sonner"
import { useTasksStore } from "~/stores/tasks"
import { tagsToFormInput } from "~/lib/tags"
import type { TaskForm } from "~/types/tasks.type"
import type { TaskItem } from "~/lib/task-filters"
import TaskDialog from "./components/TaskDialog.vue"
import TaskTable from "./components/TaskTable.vue"
import TagFilter from "~/components/TagFilter.vue"

const store = useTasksStore()

const lists = ["Personal", "Work", "Errands"]
const defaultList = lists[0] ?? "Personal"

onMounted(() => {
  store.fetchTasks()
})

const selectedTag = ref<string | null>(null)
const baseFilteredTasks = computed(() => store.tasks.filter((task) => task.status === "pending"))
const filteredTasks = computed(() => {
  if (!selectedTag.value) return baseFilteredTasks.value
  return baseFilteredTasks.value.filter((task) =>
    task.tags.some((tag) => tag.name === selectedTag.value)
  )
})
const pendingCount = computed(() => filteredTasks.value.length)

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

function openAddDialog() {
  const now = new Date()
  const today = now.toISOString().split("T")[0] ?? ""
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  editingId.value = null
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

function editTask(task: TaskItem) {
  editingId.value = task.id
  dialogOpen.value = true
  form.value = {
    title: task.title,
    description: String(task.description ?? ""),
    startDate: task.startDate ?? "",
    startTime: task.startTime ?? "",
    dueDate: task.dueDate ?? "",
    dueTime: task.dueTime ?? "",
    priority: task.priority,
    tags: tagsToFormInput(task.tags),
    list: task.list?.name ?? defaultList,
  }
}

async function saveTask() {
  if (!form.value.title.trim()) return

  try {
    if (editingId.value) {
      await store.updateTask(editingId.value, {
        title: form.value.title,
        description: form.value.description,
        dueDate: form.value.dueDate || null,
        dueTime: form.value.dueTime || null,
        priority: form.value.priority,
        list: form.value.list ? { id: form.value.list, name: form.value.list } : null,
      })
      toast.success("Task updated")
    } else {
      await store.addTask({
        title: form.value.title,
        description: form.value.description,
        startDate: form.value.startDate,
        startTime: form.value.startTime,
        priority: form.value.priority,
        dueDate: form.value.dueDate,
        dueTime: form.value.dueTime,
        tags: form.value.tags,
        list: form.value.list,
      })
      toast.success("Task created")
    }
    resetForm()
  } catch {
    toast.error("Unable to save task")
  }
}

function deleteTask(id: string) {
  store.deleteTask(id)
  toast.success("Task deleted")
}

function toggleComplete(id: string) {
  store.toggleComplete(id)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ pendingCount }} tasks pending</p>
      </div>
      <Button
        class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0"
        @click="openAddDialog"
      >
        + Add Task
      </Button>
    </div>

    <TaskDialog
      v-model:open="dialogOpen"
      v-model:form="form"
      :editing-id="editingId"
      :lists="lists"
      @save="saveTask"
      @cancel="resetForm"
    />

    <TagFilter :tasks="baseFilteredTasks" v-model="selectedTag" />

    <TaskTable
      :tasks="filteredTasks"
      @edit="editTask"
      @delete="deleteTask"
      @toggle="toggleComplete"
    />
  </div>
</template>
