<script setup lang="ts">
import { computed } from "vue"
import { Eye, Star } from 'lucide-vue-next'
import type { Task } from "~/types/tasks.type"

const props = defineProps<{
  tasks: Task[]
  selectedIds: string[]
}>()

const emit = defineEmits<{
  view: [task: Task]
  edit: [task: Task]
  delete: [id: string]
  select: [id: string]
  selectAll: []
}>()

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-rose-50 text-rose-700",
}

const listStyles: Record<string, string> = {
  Work: "bg-sky-50 text-sky-700",
  Personal: "bg-violet-50 text-violet-700",
  Errands: "bg-orange-50 text-orange-700",
}

const visibleIds = computed(() => props.tasks.map((t) => t.id))

const selectedVisibleCount = computed(
  () => props.tasks.filter((t) => props.selectedIds.includes(t.id)).length,
)

const isAllSelected = computed(
  () => props.tasks.length > 0 && selectedVisibleCount.value === props.tasks.length,
)

const isIndeterminate = computed(
  () => selectedVisibleCount.value > 0 && !isAllSelected.value,
)

function isCompleted(task: Task) {
  return task.status === "completed"
}

function dueLabel(task: Task) {
  if (!task.dueDate) return "—"
  return task.dueTime ? `${task.dueDate} ${task.dueTime}` : task.dueDate
}

function listName(task: Task) {
  return task.list?.name
}
</script>

<template>
  <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow class="hover:bg-transparent">
          <TableHead class="w-10">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate.prop="isIndeterminate"
              aria-label="Select all tasks"
              class="h-4 w-4 rounded border-border accent-teal-600 cursor-pointer"
              @change="emit('selectAll')"
            >
          </TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>List</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="tasks.length === 0">
          <TableRow>
            <TableCell :colspan="8" class="py-10 text-center text-sm text-muted-foreground">
              No tasks yet
            </TableCell>
          </TableRow>
        </template>

        <template v-else>
          <TableRow v-for="task in tasks" :key="task.id" :class="isCompleted(task) ? 'opacity-60' : ''">
            <TableCell class="w-10">
              <input
                type="checkbox"
                :checked="selectedIds.includes(task.id)"
                aria-label="Select task"
                class="h-4 w-4 rounded border-border accent-teal-600 cursor-pointer"
                @change="emit('select', task.id)"
              >
            </TableCell>

            <TableCell>
              <div class="flex items-center gap-2">
                <div class="flex flex-col">
                  <p
                    class="text-sm font-medium text-foreground"
                    :class="isCompleted(task) ? 'text-muted-foreground line-through' : ''"
                  >
                    {{ task.title }}
                  </p>
                  <p v-if="task.description" class="mt-0.5 text-xs text-muted-foreground">
                    {{ task.description }}
                  </p>
                </div>
                <Star
                  v-if="task.priority === 'high'"
                  class="w-4 h-4 text-amber-400 fill-amber-400 shrink-0"
                />
              </div>
            </TableCell>

            <TableCell>
              <Badge
                variant="secondary"
                class="capitalize"
                :class="priorityStyles[task.priority] ?? ''"
              >
                {{ task.priority }}
              </Badge>
            </TableCell>

            <TableCell>
              <Badge
                v-if="listName(task)"
                :class="listStyles[listName(task)!] ?? ''"
              >
                {{ listName(task) }}
              </Badge>
              <span v-else class="text-sm text-muted-foreground">—</span>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <div class="whitespace-nowrap">{{ task.startDate }} {{ task.startTime }}</div>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <div class="whitespace-nowrap">{{ dueLabel(task) }}</div>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <div v-if="task.tags.length" class="flex flex-wrap gap-1">
                <span
                  v-for="tag in task.tags"
                  :key="tag.id"
                  class="inline-block rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
                >
                  {{ tag.name }}
                </span>
              </div>
              <span v-else>—</span>
            </TableCell>

            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" class="rounded-lg" @click="emit('view', task)">
                  <Eye class="size-4" />
                  View
                </Button>
                <Button variant="ghost" size="sm" class="rounded-lg" @click="emit('edit', task)">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" class="rounded-lg text-destructive hover:text-destructive" @click="emit('delete', task.id)">
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
