<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { useTasksStore } from "~/stores/tasks"
import TaskDialog from "~/pages/dashboard/components/TaskDialog.vue"
import TagFilter from "~/components/TagFilter.vue"
import type { TaskForm } from "~/types/tasks.type"

definePageMeta({ layout: "default" })

const store = useTasksStore()

onMounted(() => {
  store.fetchTasks()
})

const dialogOpen = ref(false)
const selectedTag = ref<string | null>(null)

const baseFilteredTasks = computed(() => store.getTasksDueToday)
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
  store.addTask({
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
  store.toggleComplete(id)
}

function fmtTime(dateStr: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
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

    <div class="card">
      <template v-if="baseFilteredTasks.length === 0">
        <div class="empty-state">Nothing due today.</div>
      </template>
      <template v-else-if="filteredTasks.length === 0">
        <div class="empty-state">No tasks match this tag.</div>
      </template>
      <template v-else>
        <div class="row row-head">
          <span></span>
          <span>TASK</span>
          <span>PRIORITY</span>
          <span>TAG</span>
          <span>DUE</span>
          <span></span>
        </div>
        <div v-for="task in filteredTasks" :key="task.id" class="row task-row">
          <input
            type="checkbox"
            :checked="task.status === 'completed'"
            class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
            @change="handleToggle(task.id)"
          >
          <div>
            <div class="task-title" :class="{ done: task.status === 'completed' }">
              {{ task.title }}
            </div>
            <div v-if="task.description" class="task-desc">
              {{ task.description }}
            </div>
          </div>
          <span class="badge" :class="task.priority">{{ task.priority }}</span>
          <span v-if="task.tags.length > 0" class="task-tag">{{ task.tags[0]?.name }}</span>
          <span v-else></span>
          <span class="due-text">{{ fmtTime(task.dueTime) }}</span>
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

<style scoped>
.card {
  background: var(--surface-1, #fff);
  border: 1px solid var(--border, #e6e4de);
  border-radius: 14px;
  overflow: hidden;
}

.row-head {
  display: grid;
  grid-template-columns: 28px 1fr 100px 90px 100px 34px;
  gap: 14px;
  align-items: center;
  padding: 12px 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted, #9aa39d);
  letter-spacing: 0.04em;
  border-top: none;
}

.row {
  display: grid;
  grid-template-columns: 28px 1fr 100px 90px 100px 34px;
  gap: 14px;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid var(--border, #e6e4de);
}

.task-row {
  animation: rowIn 0.22s ease;
}

.task-title {
  font-weight: 600;
  font-size: 14.5px;
}

.task-title.done {
  text-decoration: line-through;
  color: var(--text-secondary, #6b7570);
  font-weight: 500;
}

.task-desc {
  font-size: 12.5px;
  color: var(--text-secondary, #6b7570);
  margin-top: 2px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge.low { background: #dcfce7; color: #166534; }
.badge.medium { background: #fef3c7; color: #92400e; }
.badge.high { background: #fee2e2; color: #991b1b; }

.task-tag {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e;
  font-size: 11px;
  font-weight: 600;
}

.due-text {
  font-size: 12px;
  color: var(--text-secondary, #6b7570);
}

.empty-state {
  padding: 28px 20px;
  text-align: center;
  color: var(--text-secondary, #6b7570);
  font-size: 14px;
}

@keyframes rowIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
