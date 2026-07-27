<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { useTasksStore } from "~/stores/tasks"
import { getUniqueTags, filterByTag } from "~/lib/task-filters"
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

const allUpcoming = computed(() => {
  const g = store.getUpcomingTasks
  return [...g.tomorrow, ...g.thisWeek, ...g.nextWeek, ...g.later]
})

const availableTags = computed(() => getUniqueTags(allUpcoming.value))

const effectiveSelectedTag = computed(() => {
  return availableTags.value.includes(selectedTag.value) ? selectedTag.value : null
})

const filteredTomorrow = computed(() => filterByTag(store.getUpcomingTasks.tomorrow, effectiveSelectedTag.value))
const filteredThisWeek = computed(() => filterByTag(store.getUpcomingTasks.thisWeek, effectiveSelectedTag.value))
const filteredNextWeek = computed(() => filterByTag(store.getUpcomingTasks.nextWeek, effectiveSelectedTag.value))
const filteredLater = computed(() => filterByTag(store.getUpcomingTasks.later, effectiveSelectedTag.value))

const filteredCount = computed(
  () =>
    filteredTomorrow.value.length +
    filteredThisWeek.value.length +
    filteredNextWeek.value.length +
    filteredLater.value.length
)

const hasAnyTasks = computed(() => allUpcoming.value.length > 0)
const hasFilteredTasks = computed(() => filteredCount.value > 0)

const form = ref<TaskForm>({
  title: "",
  description: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
  tags: "",
  list: "Personal",
})

function openAddDialog() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  form.value = {
    title: "",
    description: "",
    dueDate: tomorrowStr,
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
    priority: form.value.priority,
    dueDate: form.value.dueDate,
    dueTime: form.value.dueTime,
    list: form.value.list,
  })
  dialogOpen.value = false
}

function handleToggle(id: string) {
  store.toggleComplete(id)
}

function formatSectionDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  const month = d.toLocaleString("en-US", { month: "short" }).toLowerCase()
  const day = d.getDate().toString().padStart(2, "0")
  return `${month} ${day}`
}

function fmtTime(dateStr: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
}

function getTomorrowLabel(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatSectionDate(tomorrow.toISOString().split("T")[0])
}

function renderGroup(tasks: typeof filteredTomorrow.value) {
  return tasks.map((task) => ({
    ...task,
    dateLabel: task.dueDate ? formatSectionDate(task.dueDate) : "",
    timeLabel: fmtTime(task.dueTime),
  }))
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Upcoming</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ filteredCount }} {{ filteredCount === 1 ? "task" : "tasks" }} scheduled
        </p>
      </div>
      <button
        class="rounded-full px-4 py-1.5 text-xs font-semibold h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 cursor-pointer inline-flex items-center gap-1.5"
        @click="openAddDialog"
      >
        + Add task
      </button>
    </div>

    <TagFilter
      :tags="availableTags"
      :selected="effectiveSelectedTag"
      @select="selectedTag = $event"
    />

    <template v-if="!hasAnyTasks">
      <div class="card">
        <div class="empty-state">No upcoming tasks.</div>
      </div>
    </template>

    <template v-else-if="!hasFilteredTasks">
      <div class="card">
        <div class="empty-state">No tasks match this tag.</div>
      </div>
    </template>

    <template v-if="filteredTomorrow.length">
      <div>
        <p class="group-label">Tomorrow &middot; {{ getTomorrowLabel() }}</p>
        <div class="card">
          <div class="row row-head">
            <span></span>
            <span>TASK</span>
            <span>PRIORITY</span>
            <span>TAG</span>
            <span>DUE</span>
            <span></span>
          </div>
          <div
            v-for="task in renderGroup(filteredTomorrow)"
            :key="task.id"
            class="row task-row"
          >
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
              @change="handleToggle(task.id)"
            >
            <div>
              <div class="task-title">{{ task.title }}</div>
              <div v-if="task.description" class="task-desc">{{ task.description }}</div>
            </div>
            <span class="badge" :class="task.priority">{{ task.priority }}</span>
            <span v-if="task.tags.length > 0" class="task-tag">{{ task.tags[0].name }}</span>
            <span v-else></span>
            <span class="due-text">{{ task.dateLabel }} {{ task.timeLabel }}</span>
            <span></span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="filteredThisWeek.length">
      <div>
        <p class="group-label">This week</p>
        <div class="card">
          <div class="row row-head">
            <span></span>
            <span>TASK</span>
            <span>PRIORITY</span>
            <span>TAG</span>
            <span>DUE</span>
            <span></span>
          </div>
          <div
            v-for="task in renderGroup(filteredThisWeek)"
            :key="task.id"
            class="row task-row"
          >
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
              @change="handleToggle(task.id)"
            >
            <div>
              <div class="task-title">{{ task.title }}</div>
              <div v-if="task.description" class="task-desc">{{ task.description }}</div>
            </div>
            <span class="badge" :class="task.priority">{{ task.priority }}</span>
            <span v-if="task.tags.length > 0" class="task-tag">{{ task.tags[0].name }}</span>
            <span v-else></span>
            <span class="due-text">{{ task.dateLabel }} {{ task.timeLabel }}</span>
            <span></span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="filteredNextWeek.length">
      <div>
        <p class="group-label">Next week</p>
        <div class="card">
          <div class="row row-head">
            <span></span>
            <span>TASK</span>
            <span>PRIORITY</span>
            <span>TAG</span>
            <span>DUE</span>
            <span></span>
          </div>
          <div
            v-for="task in renderGroup(filteredNextWeek)"
            :key="task.id"
            class="row task-row"
          >
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
              @change="handleToggle(task.id)"
            >
            <div>
              <div class="task-title">{{ task.title }}</div>
              <div v-if="task.description" class="task-desc">{{ task.description }}</div>
            </div>
            <span class="badge" :class="task.priority">{{ task.priority }}</span>
            <span v-if="task.tags.length > 0" class="task-tag">{{ task.tags[0].name }}</span>
            <span v-else></span>
            <span class="due-text">{{ task.dateLabel }} {{ task.timeLabel }}</span>
            <span></span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="filteredLater.length">
      <div>
        <p class="group-label">Later</p>
        <div class="card">
          <div class="row row-head">
            <span></span>
            <span>TASK</span>
            <span>PRIORITY</span>
            <span>TAG</span>
            <span>DUE</span>
            <span></span>
          </div>
          <div
            v-for="task in renderGroup(filteredLater)"
            :key="task.id"
            class="row task-row"
          >
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
              @change="handleToggle(task.id)"
            >
            <div>
              <div class="task-title">{{ task.title }}</div>
              <div v-if="task.description" class="task-desc">{{ task.description }}</div>
            </div>
            <span class="badge" :class="task.priority">{{ task.priority }}</span>
            <span v-if="task.tags.length > 0" class="task-tag">{{ task.tags[0].name }}</span>
            <span v-else></span>
            <span class="due-text">{{ task.dateLabel }} {{ task.timeLabel }}</span>
            <span></span>
          </div>
        </div>
      </div>
    </template>

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

.group-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-muted, #9aa39d);
  margin: 20px 0 8px;
  text-transform: uppercase;
}

.group-label:first-child {
  margin-top: 0;
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
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  width: fit-content;
}

.badge.High {
  background: var(--high-bg, #fbe7de);
  color: var(--high-text, #7a2c11);
}

.badge.Medium {
  background: var(--med-bg, #faecc9);
  color: var(--med-text, #6a4405);
}

.badge.Low {
  background: var(--low-bg, #dcf1e8);
  color: var(--low-text, #0c4b36);
}

.task-tag {
  font-size: 12px;
  color: var(--text-secondary, #6b7570);
  background: #f0efe9;
  padding: 2px 9px;
  border-radius: 999px;
  width: fit-content;
}

.due-text {
  font-size: 13px;
  color: var(--text-secondary, #6b7570);
}

.empty-state {
  padding: 48px 20px;
  text-align: center;
  color: var(--text-muted, #9aa39d);
  font-size: 14px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

@keyframes rowIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .task-row {
    animation: none !important;
  }
}
</style>
