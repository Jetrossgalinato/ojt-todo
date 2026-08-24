<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { useTaskState } from "~/composables/useTaskState"
import TaskDialog from "~/pages/dashboard/components/TaskDialog.vue"
import TagFilter from "~/components/TagFilter.vue"
import type { TaskForm } from "~/types/tasks.type"
import { formatTaskTime } from "~/utils/task-dates"

definePageMeta({ layout: "default" })

const { fetchTasks, addTask, toggleComplete, tasksDueToday } = useTaskState()

onMounted(() => {
  fetchTasks()
})

const dialogOpen = ref(false)
const selectedTag = ref<string | null>(null)

const baseFilteredTasks = computed(() => tasksDueToday.value)
const filteredTasks = computed(() => {
  if (!selectedTag.value) return baseFilteredTasks.value
  return baseFilteredTasks.value.filter((task) =>
    task.tags.some((tag) => tag.name === selectedTag.value)
  )
})
const subtitleCount = computed(() => filteredTasks.value.length)

const form = ref<TaskForm>({
  title: "",
  description: "",
  startDate: "",
  startTime: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
  tags: "",
  list: "Personal",
})

function openAddDialog() {
  const now = new Date()
  const today = now.toISOString().split("T")[0] ?? ""
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  form.value = {
    title: "",
    description: "",
    startDate: today,
    startTime: currentTime,
    dueDate: today,
    dueTime: "",
    priority: "medium",
    tags: "",
    list: "Personal",
  }
  dialogOpen.value = true
}

function handleSave() {
  if (!form.value.title.trim()) return
  addTask({
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
  dialogOpen.value = false
}

function handleToggle(id: string) {
  toggleComplete(id)
}

</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Today</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ subtitleCount }} {{ subtitleCount === 1 ? "task" : "tasks" }} due today
        </p>
      </div>
      <button
        class="rounded-full px-4 py-1.5 text-xs font-semibold h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 cursor-pointer inline-flex items-center gap-1.5"
        @click="openAddDialog"
      >
        + Add task
      </button>
    </div>

    <TagFilter :tasks="baseFilteredTasks" v-model="selectedTag" />

    <div class="overflow-hidden rounded-xl border border-border bg-white">
      <template v-if="baseFilteredTasks.length === 0">
        <div class="p-7 text-center text-sm text-muted-foreground">Nothing due today.</div>
      </template>
      <template v-else-if="filteredTasks.length === 0">
        <div class="p-7 text-center text-sm text-muted-foreground">No tasks match this tag.</div>
      </template>
      <template v-else>
        <div class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span></span>
          <span>TASK</span>
          <span>PRIORITY</span>
          <span>TAG</span>
          <span>DUE</span>
          <span></span>
        </div>
        <div v-for="task in filteredTasks" :key="task.id" class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 border-t border-border px-5 py-3.5">
          <input
            type="checkbox"
            :checked="task.status === 'completed'"
            class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
            @change="handleToggle(task.id)"
          >
          <div>
            <div class="text-[14.5px] font-semibold" :class="task.status === 'completed' ? 'font-medium text-muted-foreground line-through' : ''">
              {{ task.title }}
            </div>
            <div v-if="task.description" class="mt-0.5 text-xs text-muted-foreground">
              {{ task.description }}
            </div>
          </div>
          <span class="inline-flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-bold uppercase" :class="{ 'bg-emerald-100 text-emerald-700': task.priority === 'low', 'bg-amber-100 text-amber-700': task.priority === 'medium', 'bg-rose-100 text-rose-700': task.priority === 'high' }">{{ task.priority }}</span>
          <span v-if="task.tags.length > 0" class="inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">{{ task.tags[0]?.name }}</span>
          <span v-else></span>
          <span class="text-xs text-muted-foreground">{{ formatTaskTime(task.dueTime) }}</span>
          <span></span>
        </div>
      </template>
    </div>

    <TaskDialog
      v-model:open="dialogOpen"
      v-model:form="form"
      :editing-id="null"
      :lists="['Personal', 'Work', 'Errands']"
      @save="handleSave"
      @cancel="dialogOpen = false"
    />
  </div>
</template>

