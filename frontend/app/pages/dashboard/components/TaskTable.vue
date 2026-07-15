<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { Task } from "~/types/tasks.type"
import { ref } from "vue"

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: string]
  toggle: [id: string]
}>()

const completingIds = ref(new Set<string>())
const deletingIds = ref(new Set<string>())

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

function handleToggle(id: string) {
  completingIds.value.add(id)
  emit('toggle', id)
  setTimeout(() => completingIds.value.delete(id), 400)
}

function handleDelete(id: string) {
  deletingIds.value.add(id)
  setTimeout(() => {
    emit('delete', id)
  }, 300)
}
</script>

<template>
  <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow class="hover:bg-transparent">
          <TableHead class="w-10"></TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>List</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="tasks.length === 0">
          <TableRow>
            <TableCell :colspan="7" class="py-10 text-center text-sm text-muted-foreground">
              No tasks yet
            </TableCell>
          </TableRow>
        </template>

        <template v-else>
          <TableRow
            v-for="(task, index) in tasks"
            :key="task.id"
            class="animate-task-in"
            :class="[
              deletingIds.has(task.id) ? 'animate-task-out' : '',
              `stagger-${Math.min(index + 1, 8)}`
            ]"
          >
            <TableCell class="w-10">
              <button
                class="h-5 w-5 rounded-md border border-border flex items-center justify-center cursor-pointer transition-colors"
                :class="task.status === 'completed' ? 'bg-teal-600 border-teal-600' : 'bg-white hover:border-teal-400'"
                @click="handleToggle(task.id)"
              >
                <svg v-if="task.status === 'completed'" class="animate-checkbox w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </TableCell>

            <TableCell>
              <div class="flex items-center gap-2">
                <div class="flex flex-col">
                  <p
                    class="text-sm font-medium transition-colors duration-200"
                    :class="[
                      task.status === 'completed' ? 'text-muted-foreground' : 'text-foreground',
                      task.status === 'completed' ? 'animate-strike' : ''
                    ]"
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
              <span
                class="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                :class="priorityStyles[task.priority] ?? 'bg-muted text-muted-foreground'"
              >
                {{ task.priority }}
              </span>
            </TableCell>

            <TableCell>
              <span
                v-if="task.list"
                class="rounded-full px-2.5 py-1 text-xs font-medium"
                :class="listStyles[task.list.name] ?? 'bg-muted text-muted-foreground'"
              >
                {{ task.list.name }}
              </span>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <div class="whitespace-nowrap">{{ task.dueDate }} {{ task.dueTime }}</div>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <div class="flex flex-wrap gap-1">
                <span v-for="tag in task.tags" :key="tag.id" class="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {{ tag.name }}
                </span>
              </div>
            </TableCell>

            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" class="rounded-lg animate-btn-press" @click="emit('edit', task)">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" class="rounded-lg text-destructive hover:text-destructive animate-btn-press" @click="handleDelete(task.id)">
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