<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { Task } from "~/types/tasks.type"

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: string]
  toggle: [id: string]
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
</script>

<template>
  <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
    <!-- Mobile: Card layout -->
    <div class="divide-y divide-border md:hidden">
      <template v-if="tasks.length === 0">
        <div class="py-10 text-center text-sm text-muted-foreground">
          No tasks yet
        </div>
      </template>
      <template v-else>
        <div
          v-for="task in tasks"
          :key="task.id"
          class="flex items-start gap-3 p-4"
        >
          <input
            type="checkbox"
            :checked="task.completed"
            class="mt-0.5 h-5 w-5 shrink-0 rounded-md border-border accent-primary cursor-pointer"
            @change="emit('toggle', task.id)"
          >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p
                class="text-sm font-medium text-foreground truncate"
                :class="task.completed ? 'text-muted-foreground line-through' : ''"
              >
                {{ task.title }}
              </p>
              <Star
                v-if="task.priority === 'high'"
                class="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0"
              />
            </div>
            <p v-if="task.description" class="mt-0.5 text-xs text-muted-foreground truncate">
              {{ task.description }}
            </p>
            <div class="mt-2 flex flex-wrap items-center gap-1.5">
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
                :class="priorityStyles[task.priority] ?? 'bg-muted text-muted-foreground'"
              >
                {{ task.priority }}
              </span>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                :class="listStyles[task.list] ?? 'bg-muted text-muted-foreground'"
              >
                {{ task.list }}
              </span>
              <span v-if="task.startDate" class="text-[11px] text-muted-foreground">
                {{ task.startDate }}
              </span>
              <span v-if="task.dueDate" class="text-[11px] text-muted-foreground">
                Due {{ task.dueDate }}
              </span>
              <span
                v-for="tag in task.tags"
                :key="tag.id"
                class="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
              >
                {{ tag.name }}
              </span>
            </div>
            <div class="mt-2.5 flex items-center gap-1">
              <Button variant="ghost" size="sm" class="h-7 px-2 text-xs rounded-lg" @click="emit('edit', task)">
                Edit
              </Button>
              <Button variant="ghost" size="sm" class="h-7 px-2 text-xs rounded-lg text-destructive hover:text-destructive" @click="emit('delete', task.id)">
                Delete
              </Button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Desktop: Table layout -->
    <div class="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="w-10"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Category</TableHead>
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
            <TableRow v-for="task in tasks" :key="task.id">
              <TableCell class="w-10">
                <input
                  type="checkbox"
                  :checked="task.completed"
                  class="h-5 w-5 rounded-md border-border accent-primary cursor-pointer"
                  @change="emit('toggle', task.id)"
                >
              </TableCell>

              <TableCell>
                <div class="flex items-center gap-2">
                  <div class="flex flex-col">
                    <p
                      class="text-sm font-medium text-foreground"
                      :class="task.completed ? 'text-muted-foreground line-through' : ''"
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
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="listStyles[task.list] ?? 'bg-muted text-muted-foreground'"
                >
                  {{ task.list }}
                </span>
              </TableCell>

              <TableCell class="text-sm text-muted-foreground">
                <div class="whitespace-nowrap">{{ task.startDate }} {{ task.startTime }}</div>
              </TableCell>

              <TableCell class="text-sm text-muted-foreground">
                <div class="whitespace-nowrap">{{ task.dueDate }} {{ task.dueTime }}</div>
              </TableCell>

              <TableCell class="text-sm text-muted-foreground">
                <div v-if="task.tags.length" class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in task.tags"
                    :key="tag.id"
                    class="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {{ tag.name }}
                  </span>
                </div>
                <span v-else>&mdash;</span>
              </TableCell>

              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-1">
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
  </div>
</template>
