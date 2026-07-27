<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { toast } from "vue-sonner"
import { useTasksStore } from "~/stores/tasks"
import { tagsToFormInput } from "~/lib/tags"
import { parseTags } from "~/lib/tags"
import type { TaskForm } from "~/types/tasks.type"
import type { TaskItem } from "~/lib/task-filters"
import { getUniqueTags, filterByTag } from "~/lib/task-filters"
import TaskDialog from "./components/TaskDialog.vue"
import TaskTable from "./components/TaskTable.vue"
import TagFilter from "~/components/TagFilter.vue"

const store = useTasksStore()

const lists = ["Personal", "Work", "Errands"]
const defaultList = lists[0] ?? "Personal"

onMounted(() => {
  store.fetchTasks()
})

const allPending = computed(() => store.tasks.filter((t) => t.status === "pending"))
const selectedTag = ref<string | null>(null)

const uniqueTags = computed(() => getUniqueTags(allPending.value))

// auto-clear the filter if the currently selected tag no longer exists
// (e.g. the last task with that tag was deleted)
watch(uniqueTags, (tags) => {
  if (selectedTag.value && !tags.includes(selectedTag.value)) {
    selectedTag.value = null
  }
})

const filteredPending = computed(() => filterByTag(allPending.value, selectedTag.value))
const pendingCount = computed(() => filteredPending.value.length)
const filteredTasks = computed(() => filterByTag(store.tasks, selectedTag.value))

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)

const form = ref<TaskForm>({
  title: "",
  description: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
  tags: "",
  list: defaultList,
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
    description: task.description,
    dueDate: task.dueDate ?? "",
    dueTime: task.dueTime ?? "",
    priority: task.priority,
    tags: tagsToFormInput(task.tags),
    list: task.list?.name ?? defaultList,
  }
}

function saveTask() {
  if (!form.value.title.trim()) return

  const parsedTags = parseTags(form.value.tags)

  if (editingId.value) {
    store.updateTask(editingId.value, {
      title: form.value.title,
      description: form.value.description,
      dueDate: form.value.dueDate || null,
      dueTime: form.value.dueTime || null,
      priority: form.value.priority,
      list: form.value.list ? { id: form.value.list, name: form.value.list } : null,
      tags: parsedTags,
    })
    toast.success("Task updated")
  } else {
    store.addTask({
      title: form.value.title,
      description: form.value.description,
      priority: form.value.priority,
      dueDate: form.value.dueDate,
      dueTime: form.value.dueTime,
      list: form.value.list,
      tags: parsedTags,
    })
    toast.success("Task created")
  }
  resetForm()
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

    <TagFilter
      :tags="uniqueTags"
      :selected="selectedTag"
      @select="selectedTag = $event"
    />

    <TaskTable
      :tasks="filteredTasks"
      @edit="editTask"
      @delete="deleteTask"
      @toggle="toggleComplete"
    />
  </div>
</template>