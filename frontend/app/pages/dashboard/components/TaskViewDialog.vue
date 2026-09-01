<script setup lang="ts">
import { computed } from "vue"
import type { Task } from "~/types/tasks.type"

const props = defineProps<{
  task: Task | null
}>()

const open = defineModel<boolean>("open", { required: true })

const isCompleted = computed(() => props.task?.status === "completed")

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

function formatDateTime(value: string | null, time: string | null) {
  if (!value) return "—"
  return time ? `${value} ${time}` : value
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogPortal>
      <DialogOverlay />
      <DialogContent class="rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">
            {{ task?.title ?? "Task details" }}
          </DialogTitle>
          <DialogDescription class="sr-only">
            Read-only view of task details
          </DialogDescription>
        </DialogHeader>

        <div v-if="task" class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <Badge
              :class="isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-teal-50 text-teal-700'"
            >
              {{ isCompleted ? "Completed" : "Pending" }}
            </Badge>
            <Badge
              variant="secondary"
              class="capitalize"
              :class="priorityStyles[task.priority] ?? ''"
            >
              {{ task.priority }} priority
            </Badge>
            <Badge
              v-if="task.list"
              :class="listStyles[task.list.name] ?? ''"
            >
              {{ task.list.name }}
            </Badge>
          </div>

          <div v-if="task.description" class="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p class="text-sm whitespace-pre-wrap text-foreground">{{ task.description }}</p>
          </div>

          <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt class="text-xs font-medium text-muted-foreground">Start</dt>
              <dd class="mt-0.5 text-foreground">{{ formatDateTime(task.startDate, task.startTime) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-muted-foreground">Due</dt>
              <dd class="mt-0.5 text-foreground">{{ formatDateTime(task.dueDate, task.dueTime) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-muted-foreground">Created</dt>
              <dd class="mt-0.5 text-foreground">{{ formatTimestamp(task.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-muted-foreground">Last updated</dt>
              <dd class="mt-0.5 text-foreground">{{ formatTimestamp(task.updatedAt) }}</dd>
            </div>
          </dl>

          <div v-if="task.tags.length" class="grid gap-1.5">
            <dt class="text-xs font-medium text-muted-foreground">Tags</dt>
            <dd>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in task.tags"
                  :key="tag.id"
                  class="inline-block rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
                >
                  {{ tag.name }}
                </span>
              </div>
            </dd>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" class="rounded-xl" @click="open = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>
