<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useTasks } from "~/composables/useTasks"
import { useAuthStore } from "~/stores/auth.store"
import type { Task, UpcomingGroup, TaskForm } from "~/types/tasks.type"
import TaskDialog from "~/pages/dashboard/components/TaskDialog.vue"

const { fetchUpcoming, createTask, toggleComplete: apiToggle, deleteTask: apiDeleteTask } = useTasks()
const authStore = useAuthStore()

const groups = ref<UpcomingGroup>({ tomorrow: [], thisWeek: [], nextWeek: [], later: [] })
const loading = ref(true)
const errorMsg = ref("")
const activeFilter = ref("All")

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref<TaskForm>({ title: "", description: "", dueDate: "", dueTime: "", priority: "medium", listId: "", tags: "" })

function getNextWeekday(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().split("T")[0]
}

onMounted(async () => {
  if (!authStore.accessToken) return navigateTo("/login")
  try {
    groups.value = await fetchUpcoming()
  } catch (err: any) {
    console.error("Failed to load upcoming tasks:", err)
    errorMsg.value = err?.data?.message || err?.message || "Failed to load tasks"
  } finally {
    loading.value = false
  }
})

const allTasks = computed<Task[]>(() => [
  ...groups.value.tomorrow,
  ...groups.value.thisWeek,
  ...groups.value.nextWeek,
  ...groups.value.later,
])

const filteredTasks = computed(() => {
  if (activeFilter.value === "All") return allTasks.value
  return allTasks.value.filter((t) => t.list?.name === activeFilter.value)
})

const totalDays = 14

const dateCards = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const taskMap = new Map<string, Task[]>()
  for (const task of filteredTasks.value) {
    if (!task.dueDate) continue
    const key = task.dueDate
    if (!taskMap.has(key)) taskMap.set(key, [])
    taskMap.get(key)!.push(task)
  }

  const cards: { date: Date; dateStr: string; label: string; tasks: Task[] }[] = []

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split("T")[0]
    const tasks = taskMap.get(key) ?? []

    let label = ""
    if (i === 0) label = "Today"
    else if (i === 1) label = "Tomorrow"
    else {
      label = d.toLocaleDateString("en-US", { weekday: "short" })
    }

    if (tasks.length > 0) {
      cards.push({ date: d, dateStr: key, label, tasks })
    }
  }

  return cards
})

const visibleCards = computed(() => dateCards.value.slice(0, 6))
const extraCount = computed(() => Math.max(0, filteredTasks.value.length - visibleCards.value.reduce((sum, c) => sum + c.tasks.length, 0)))
const lastVisibleDate = computed(() => {
  if (visibleCards.value.length === 0) return ""
  const last = visibleCards.value[visibleCards.value.length - 1].date
  return last.toLocaleDateString("en-US", { month: "short", day: "numeric" })
})

const totalFiltered = computed(() => filteredTasks.value.length)

const filterOptions = ["All", "Work", "Personal", "Errands"]

const priorityDot: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-400",
  high: "bg-rose-500",
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  const day = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "short" })
  return `${month} ${day}`
}

function getDateNum(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getDate()
}

function openAddTask() {
  editingId.value = null
  form.value = { title: "", description: "", dueDate: getNextWeekday(1), dueTime: "", priority: "medium", listId: "", tags: "" }
  dialogOpen.value = true
}

function resetForm() {
  editingId.value = null
  dialogOpen.value = false
  form.value = { title: "", description: "", dueDate: "", dueTime: "", priority: "medium", listId: "", tags: "" }
}

async function saveTask() {
  if (!form.value.title.trim()) return
  try {
    await createTask(form.value)
    groups.value = await fetchUpcoming()
    resetForm()
  } catch (err) {
    console.error("Failed to save task:", err)
  }
}

async function toggleComplete(id: string) {
  try {
    const updated = await apiToggle(id)
    if (updated.status === "completed") {
      groups.value = await fetchUpcoming()
    }
  } catch (err) {
    console.error("Failed to toggle task:", err)
  }
}

async function deleteTask(id: string) {
  try {
    await apiDeleteTask(id)
    groups.value = await fetchUpcoming()
  } catch (err) {
    console.error("Failed to delete task:", err)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between animate-card-in stagger-1">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Upcoming</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ totalFiltered }} tasks in the next {{ totalDays }} days
        </p>
      </div>
      <Button
        @click="openAddTask"
        class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 animate-btn-press"
      >
        + Add task
      </Button>
    </div>

    <div class="flex gap-2 flex-wrap animate-card-in stagger-2">
      <button
        v-for="f in filterOptions"
        :key="f"
        @click="activeFilter = f"
        class="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 border animate-btn-press"
        :class="activeFilter === f
          ? 'bg-teal-700 text-white border-teal-700'
          : 'bg-white text-muted-foreground border-border hover:bg-muted'"
      >
        {{ f }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-10 text-sm text-muted-foreground">Loading...</div>

    <div v-else-if="errorMsg" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {{ errorMsg }}
    </div>

    <template v-else>
      <div v-if="totalFiltered === 0" class="rounded-2xl border border-dashed border-border py-16 text-center">
        <p class="text-sm text-muted-foreground mb-2">No upcoming tasks{{ activeFilter !== "All" ? ` in ${activeFilter}` : "" }}</p>
        <p class="text-xs text-muted-foreground mb-4">Tasks with due dates in the next {{ totalDays }} days will appear here.</p>
        <Button
          @click="openAddTask"
          class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0 animate-btn-press"
        >
          + Add a Task
        </Button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(card, index) in visibleCards"
          :key="card.dateStr"
          class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden animate-card-in"
          :class="`stagger-${Math.min(index + 3, 8)}`"
        >
          <div class="flex items-baseline justify-between px-4 pt-4 pb-2">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-foreground">{{ getDateNum(card.dateStr) }}</span>
              <span class="text-sm text-muted-foreground">{{ formatDate(card.dateStr) }}</span>
            </div>
            <span class="text-xs text-muted-foreground">{{ card.label }}</span>
          </div>
          <p class="px-4 text-xs text-muted-foreground mb-2">{{ card.tasks.length }} task{{ card.tasks.length !== 1 ? "s" : "" }}</p>
          <div class="divide-y divide-border">
            <div
              v-for="task in card.tasks"
              :key="task.id"
              class="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30"
            >
              <input
                type="checkbox"
                :checked="task.status === 'completed'"
                class="h-4 w-4 rounded border-border accent-teal-600 cursor-pointer shrink-0"
                @change="toggleComplete(task.id)"
              >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ task.title }}</p>
              </div>
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="priorityDot[task.priority]"
                :title="task.priority"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="extraCount > 0"
        class="rounded-2xl border border-dashed border-border bg-muted/20 py-4 px-6 text-center"
      >
        <p class="text-sm text-muted-foreground">
          +{{ extraCount }} more tasks through {{ lastVisibleDate }}
        </p>
      </div>
    </template>

    <TaskDialog
      v-model:open="dialogOpen"
      v-model:form="form"
      :editing-id="editingId"
      @save="saveTask"
      @cancel="resetForm"
    />
  </div>
</template>
