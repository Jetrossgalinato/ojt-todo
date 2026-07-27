<script setup lang="ts">
interface TaskRowItem {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  dueTime?: string | null
  dueDate?: string | null
  completed?: boolean
  completedAt?: string | null
}

const props = defineProps<{
  task: TaskRowItem
  showUndo?: boolean
  showDue?: boolean
  showDateTime?: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  undo: [id: string]
}>()

const priorityStyles: Record<string, string> = {
  low: "bg-teal-50 text-teal-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-rose-50 text-rose-700",
}

function formatCompletedAt(dateStr: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const month = d.toLocaleString("en-US", { month: "short" }).toLowerCase()
  const day = d.getDate()
  const hours = d.getHours().toString().padStart(2, "0")
  const mins = d.getMinutes().toString().padStart(2, "0")
  return `${month} ${day}, ${hours}:${mins}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  const month = d.toLocaleString("en-US", { month: "short" }).toLowerCase()
  const day = d.getDate()
  return `${month} ${day}`
}
</script>

<template>
  <div class="flex items-center gap-4 py-3 px-4">
    <button
      class="shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
      :class="task.completed
        ? 'bg-teal-600 border-teal-600'
        : 'border-gray-300 hover:border-teal-500'"
      @click="emit('toggle', task.id)"
    >
      <svg
        v-if="task.completed"
        class="w-3 h-3 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <div class="flex-1 min-w-0">
      <p
        class="text-sm font-medium"
        :class="task.completed ? 'line-through text-muted-foreground' : 'text-foreground'"
      >
        {{ task.title }}
      </p>
      <p v-if="task.description" class="text-xs text-muted-foreground mt-0.5 truncate">
        {{ task.description }}
      </p>
    </div>

    <span
      class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize"
      :class="priorityStyles[task.priority] ?? 'bg-muted text-muted-foreground'"
    >
      {{ task.priority }}
    </span>

    <div class="shrink-0 text-xs text-muted-foreground w-28 text-right">
      <template v-if="showUndo">
        {{ formatCompletedAt(task.completedAt) }}
      </template>
      <template v-else-if="showDateTime">
        <span v-if="task.dueDate">{{ formatDate(task.dueDate) }}</span>
        <span v-if="task.dueTime" class="ml-1">{{ task.dueTime }}</span>
      </template>
      <template v-else-if="showDue && task.dueTime">
        {{ task.dueTime }}
      </template>
    </div>

    <button
      v-if="showUndo"
      class="shrink-0 text-xs text-blue-600 hover:text-blue-800 font-medium"
      @click="emit('undo', task.id)"
    >
      Undo
    </button>
  </div>
</template>
