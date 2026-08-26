<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { toast } from "vue-sonner"
import { useTasks } from "~/composables/useTasks"
import { useTags, type Tag } from "~/composables/useTags"
import { getApiErrorMessage } from "~/lib/get-api-error"
import { tagsToFormInput } from "~/lib/tags"
import type { Task, TaskForm } from "~/types/tasks.type"
import TagFilter from "~/components/TagFilter.vue"
import TaskDialog from "./components/TaskDialog.vue"
import TaskViewDialog from "./components/TaskViewDialog.vue"
import TaskTable from "./components/TaskTable.vue"

const { fetchTasks, createTask, updateTask, deleteTask: apiDeleteTask, batchDeleteTasks } = useTasks()
const { fetchTags } = useTags()
const authStore = useAuthStore()

const lists = ["Personal", "Work", "Errands"]
const defaultList = lists[0] ?? "Personal"

const tasks = ref<Task[]>([])
const tags = ref<Tag[]>([])
const selectedTag = ref<string | null>(null)

const page = ref(1)
const limit = ref(10)
const total = ref(0)
const totalPages = ref(0)
const loading = ref(false)

const selectedIds = ref<string[]>([])
const selectedCount = computed(() => selectedIds.value.length)

const viewOpen = ref(false)
const viewingTask = ref<Task | null>(null)

async function loadTasks() {
  loading.value = true
  try {
    const res = await fetchTasks({
      page: page.value,
      limit: limit.value,
      tag: selectedTag.value ?? undefined,
    })
    tasks.value = res.data
    total.value = res.total
    totalPages.value = res.totalPages
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to load tasks."))
  } finally {
    loading.value = false
  }
}

watch(page, () => {
  selectedIds.value = []
  loadTasks()
})

watch(selectedTag, () => {
  selectedIds.value = []
  if (page.value !== 1) {
    page.value = 1
    return
  }
  loadTasks()
})

onMounted(async () => {
  const [fetchedTags] = await Promise.all([
    fetchTags().catch(() => []),
    loadTasks(),
  ])
  tags.value = fetchedTags
})

const pendingCount = computed(() => tasks.value.filter((t) => t.status === "pending").length)

const rangeStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * limit.value + 1))
const rangeEnd = computed(() => Math.min(page.value * limit.value, total.value))

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
    description: task.description ?? "",
    startDate: task.startDate,
    startTime: task.startTime,
    dueDate: task.dueDate ?? "",
    dueTime: task.dueTime ?? "",
    priority: task.priority,
    tags: tagsToFormInput(task.tags),
    list: task.list?.name ?? defaultList,
  }
}

function viewTask(task: Task) {
  viewingTask.value = task
  viewOpen.value = true
}

async function saveTask() {
  if (!form.value.title.trim()) return

  if (!authStore.accessToken) {
    return navigateTo("/login")
  }

  try {
    if (editingId.value) {
      await updateTask(editingId.value, form.value)
      toast.success("Task updated")
    } else {
      await createTask(form.value)
      toast.success("Task created")
      selectedIds.value = []
      if (page.value !== 1) {
        page.value = 1
        resetForm()
        return
      }
    }
    resetForm()
    await loadTasks()
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to save task."))
  }
}

async function deleteTask(id: string) {
  try {
    await apiDeleteTask(id)
    selectedIds.value = selectedIds.value.filter((s) => s !== id)
    toast.success("Task deleted")
    await loadTasks()
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to delete task."))
  }
}

async function deleteSelected() {
  if (selectedIds.value.length === 0) return
  try {
    await batchDeleteTasks(selectedIds.value)
    selectedIds.value = []
    toast.success("Selected tasks deleted")
    await loadTasks()
  } catch (error: unknown) {
    toast.error(getApiErrorMessage(error, "Failed to delete selected tasks."))
  }
}

function toggleSelect(id: string) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((s) => s !== id)
    : [...selectedIds.value, id]
}

function toggleSelectAll() {
  const visibleIds = tasks.value.map((t) => t.id)
  const allSelected = visibleIds.every((id) => selectedIds.value.includes(id))
  if (allSelected) {
    const selected = new Set(selectedIds.value)
    visibleIds.forEach((id) => selected.delete(id))
    selectedIds.value = [...selected]
  } else {
    const selected = new Set(selectedIds.value)
    visibleIds.forEach((id) => selected.add(id))
    selectedIds.value = [...selected]
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
      <div class="flex items-center gap-2">
        <Button
          v-if="selectedCount > 0"
          variant="outline"
          class="rounded-full px-4 py-1.5 text-xs h-auto border-destructive/40 text-destructive hover:text-destructive"
          @click="deleteSelected"
        >
          Delete selected ({{ selectedCount }})
        </Button>
        <Button
          @click="handleAddClick"
          class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0"
        >
          + Add Task
        </Button>
      </div>
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

    <TaskViewDialog v-model:open="viewOpen" :task="viewingTask" />

    <TaskTable
      :tasks="tasks"
      :selected-ids="selectedIds"
      @view="viewTask"
      @edit="editTask"
      @delete="deleteTask"
      @select="toggleSelect"
      @select-all="toggleSelectAll"
    />

    <div v-if="totalPages > 1" class="flex flex-col items-center gap-2">
      <Pagination
        v-model:page="page"
        :total="total"
        :items-per-page="limit"
        :sibling-count="1"
        show-edges
        :disabled="loading"
      >
        <PaginationContent v-slot="{ items }">
          <PaginationFirst />
          <PaginationPrevious />
          <template v-for="(item, index) in items" :key="index">
            <PaginationEllipsis v-if="item.type === 'ellipsis'" />
            <PaginationItem
              v-else
              :value="item.value"
              :is-active="item.value === page"
            >
              {{ item.value }}
            </PaginationItem>
          </template>
          <PaginationNext />
          <PaginationLast />
        </PaginationContent>
      </Pagination>
      <p class="text-xs text-muted-foreground">
        Showing {{ rangeStart }}–{{ rangeEnd }} of {{ total }} tasks
      </p>
    </div>
  </div>
</template>
