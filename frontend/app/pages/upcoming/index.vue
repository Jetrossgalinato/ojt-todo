<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { useTaskState } from "~/composables/useTaskState"
import { filterByTag } from "~/utils/task-filters"
import TaskDialog from "~/pages/dashboard/components/TaskDialog.vue"
import TagFilter from "~/components/TagFilter.vue"
import type { TaskForm } from "~/types/tasks.type"
import { formatSectionDate, formatTaskTime, getTomorrowDateLabel } from "~/utils/task-dates"

definePageMeta({ layout: "default" })

const { fetchTasks, addTask, toggleComplete, upcomingTasks } = useTaskState()

onMounted(() => {
  fetchTasks()
})

const dialogOpen = ref(false)
const selectedTag = ref<string | null>(null)

const baseFilteredTasks = computed(() => {
  const g = upcomingTasks.value
  return [...g.tomorrow, ...g.thisWeek, ...g.nextWeek, ...g.later]
})

const filteredTomorrow = computed(() => filterByTag(upcomingTasks.value.tomorrow, selectedTag.value))
const filteredThisWeek = computed(() => filterByTag(upcomingTasks.value.thisWeek, selectedTag.value))
const filteredNextWeek = computed(() => filterByTag(upcomingTasks.value.nextWeek, selectedTag.value))
const filteredLater = computed(() => filterByTag(upcomingTasks.value.later, selectedTag.value))

const filteredCount = computed(
  () =>
    filteredTomorrow.value.length +
    filteredThisWeek.value.length +
    filteredNextWeek.value.length +
    filteredLater.value.length
)

const hasAnyTasks = computed(() => baseFilteredTasks.value.length > 0)
const hasFilteredTasks = computed(() => filteredCount.value > 0)

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
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0] ?? ""

  form.value = {
    title: "",
    description: "",
    startDate: tomorrowStr,
    startTime: currentTime,
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

function renderGroup(tasks: typeof filteredTomorrow.value) {
  return tasks.map((task) => ({
    ...task,
    dateLabel: task.dueDate ? formatSectionDate(task.dueDate) : "",
    timeLabel: formatTaskTime(task.dueTime),
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

    <TagFilter :tasks="baseFilteredTasks" v-model="selectedTag" />

    <template v-if="!hasAnyTasks">
      <div class="overflow-hidden rounded-xl border border-border bg-white">
      <div class="p-7 text-center text-sm text-muted-foreground">No upcoming tasks.</div>
      </div>
    </template>

    <template v-else-if="!hasFilteredTasks">
      <div class="overflow-hidden rounded-xl border border-border bg-white">
      <div class="p-7 text-center text-sm text-muted-foreground">No tasks match this tag.</div>
      </div>
    </template>

    <template v-if="filteredTomorrow.length">
      <div>
        <p class="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tomorrow &middot; {{ getTomorrowDateLabel() }}</p>
        <div class="overflow-hidden rounded-xl border border-border bg-white">
          <div class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span></span>
            <span>TASK</span>
            <span>PRIORITY</span>
            <span>TAG</span>
            <span>DUE</span>
            <span></span>
          </div>
          <div v-for="task in renderGroup(filteredTomorrow)" :key="task.id" class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 border-t border-border px-5 py-3.5">
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
              @change="handleToggle(task.id)"
            >
            <div>
              <div class="text-[14.5px] font-semibold">{{ task.title }}</div>
              <div v-if="task.description" class="mt-0.5 text-xs text-muted-foreground">{{ task.description }}</div>
            </div>
            <span class="inline-flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-bold uppercase" :class="{ 'bg-emerald-100 text-emerald-700': task.priority === 'low', 'bg-amber-100 text-amber-700': task.priority === 'medium', 'bg-rose-100 text-rose-700': task.priority === 'high' }">{{ task.priority }}</span>
            <span v-if="task.tags.length > 0" class="inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">{{ task.tags[0]?.name }}</span>
            <span v-else></span>
            <span class="text-xs text-muted-foreground">{{ task.dateLabel }} {{ task.timeLabel }}</span>
            <span></span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="filteredThisWeek.length">
      <div>
        <p class="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">This week</p>
        <div class="overflow-hidden rounded-xl border border-border bg-white">
          <div class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span></span>
            <span>TASK</span>
            <span>PRIORITY</span>
            <span>TAG</span>
            <span>DUE</span>
            <span></span>
          </div>
          <div v-for="task in renderGroup(filteredThisWeek)" :key="task.id" class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 border-t border-border px-5 py-3.5">
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
              @change="handleToggle(task.id)"
            >
            <div>
              <div class="text-[14.5px] font-semibold">{{ task.title }}</div>
              <div v-if="task.description" class="mt-0.5 text-xs text-muted-foreground">{{ task.description }}</div>
            </div>
            <span class="inline-flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-bold uppercase" :class="{ 'bg-emerald-100 text-emerald-700': task.priority === 'low', 'bg-amber-100 text-amber-700': task.priority === 'medium', 'bg-rose-100 text-rose-700': task.priority === 'high' }">{{ task.priority }}</span>
            <span v-if="task.tags.length > 0" class="inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">{{ task.tags[0]?.name }}</span>
            <span v-else></span>
            <span class="text-xs text-muted-foreground">{{ task.dateLabel }} {{ task.timeLabel }}</span>
            <span></span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="filteredNextWeek.length">
      <div>
        <p class="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Next week</p>
        <div class="overflow-hidden rounded-xl border border-border bg-white">
          <div class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span></span>
            <span>TASK</span>
            <span>PRIORITY</span>
            <span>TAG</span>
            <span>DUE</span>
            <span></span>
          </div>
          <div v-for="task in renderGroup(filteredNextWeek)" :key="task.id" class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 border-t border-border px-5 py-3.5">
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
              @change="handleToggle(task.id)"
            >
            <div>
              <div class="text-[14.5px] font-semibold">{{ task.title }}</div>
              <div v-if="task.description" class="mt-0.5 text-xs text-muted-foreground">{{ task.description }}</div>
            </div>
            <span class="inline-flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-bold uppercase" :class="{ 'bg-emerald-100 text-emerald-700': task.priority === 'low', 'bg-amber-100 text-amber-700': task.priority === 'medium', 'bg-rose-100 text-rose-700': task.priority === 'high' }">{{ task.priority }}</span>
            <span v-if="task.tags.length > 0" class="inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">{{ task.tags[0]?.name }}</span>
            <span v-else></span>
            <span class="text-xs text-muted-foreground">{{ task.dateLabel }} {{ task.timeLabel }}</span>
            <span></span>
          </div>
        </div>
      </div>
    </template>

    <template v-if="filteredLater.length">
      <div>
        <p class="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Later</p>
        <div class="overflow-hidden rounded-xl border border-border bg-white">
          <div class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span></span>
            <span>TASK</span>
            <span>PRIORITY</span>
            <span>TAG</span>
            <span>DUE</span>
            <span></span>
          </div>
          <div v-for="task in renderGroup(filteredLater)" :key="task.id" class="grid grid-cols-[28px_minmax(0,1fr)_100px_90px_100px_34px] items-center gap-3 border-t border-border px-5 py-3.5">
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              class="h-5 w-5 rounded-md border-border accent-teal-600 cursor-pointer"
              @change="handleToggle(task.id)"
            >
            <div>
              <div class="text-[14.5px] font-semibold">{{ task.title }}</div>
              <div v-if="task.description" class="mt-0.5 text-xs text-muted-foreground">{{ task.description }}</div>
            </div>
            <span class="inline-flex items-center justify-center rounded-full px-2 py-1 text-[11px] font-bold uppercase" :class="{ 'bg-emerald-100 text-emerald-700': task.priority === 'low', 'bg-amber-100 text-amber-700': task.priority === 'medium', 'bg-rose-100 text-rose-700': task.priority === 'high' }">{{ task.priority }}</span>
            <span v-if="task.tags.length > 0" class="inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">{{ task.tags[0]?.name }}</span>
            <span v-else></span>
            <span class="text-xs text-muted-foreground">{{ task.dateLabel }} {{ task.timeLabel }}</span>
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

