<script setup lang="ts">
import { computed } from "vue"
import type { TaskForm } from "~/types/tasks.type"
import { validateStartDate, validateDueDate } from "~/lib/validate-due-date"

defineProps<{
  lists: string[]
  editingId: string | null
}>()

const emit = defineEmits<{
  save: []
  cancel: []
}>()

const open = defineModel<boolean>("open", { required: true })
const form = defineModel<TaskForm>("form", { required: true })

const today = new Date().toISOString().split("T")[0]

const startDateError = computed(() => {
  return validateStartDate(form.value.startDate)
})

const dateError = computed(() => {
  const { startDate, startTime, dueDate, dueTime } = form.value
  return startDateError.value || validateDueDate(startDate, startTime, dueDate, dueTime)
})

const isDisabled = computed(() => !form.value.title.trim() || !!dateError.value)
</script>

<template>
  <Dialog v-model:open="open">
    <DialogPortal>
      <DialogOverlay />
      <DialogContent class="rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">
            {{ editingId ? "Edit task" : "Add task" }}
          </DialogTitle>
          <DialogDescription class="sr-only">
            {{ editingId ? "Edit the details of your task" : "Fill in the details to create a new task" }}
          </DialogDescription>
        </DialogHeader>

        <div class="flex flex-col gap-4">
          <div class="grid gap-1.5">
            <Label for="title">Title</Label>
            <Input id="title" v-model="form.title" placeholder="Task title" class="h-11 rounded-xl" />
          </div>

          <div class="grid gap-1.5">
            <Label for="description">Description / notes</Label>
            <textarea
              id="description"
              v-model="form.description"
              rows="2"
              placeholder="Optional notes..."
              class="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5">
              <Label for="start-date">Start date</Label>
              <Input id="start-date" v-model="form.startDate" type="date" :min="today" class="h-11 rounded-xl" :class="startDateError ? 'border-red-500 focus:border-red-500' : ''" required />
            </div>
            <div class="grid gap-1.5">
              <Label for="start-time">Start time</Label>
              <Input id="start-time" v-model="form.startTime" type="time" class="h-11 rounded-xl" required />
            </div>
          </div>
            <p v-if="startDateError" class="text-xs text-red-500">{{ startDateError }}</p>

          <div class="grid gap-1.5">
            <div class="grid grid-cols-2 gap-3">
              <div class="grid gap-1.5">
                <Label for="due-date">Due date</Label>
                <Input
                  id="due-date"
                  v-model="form.dueDate"
                  type="date"
                  :min="form.startDate || undefined"
                  class="h-11 rounded-xl"
                  :class="dateError ? 'border-red-500 focus:border-red-500' : ''"
                />
              </div>
              <div class="grid gap-1.5">
                <Label for="due-time">Due time</Label>
                <Input
                  id="due-time"
                  v-model="form.dueTime"
                  type="time"
                  class="h-11 rounded-xl"
                  :class="dateError ? 'border-red-500 focus:border-red-500' : ''"
                />
              </div>
            </div>
            <p v-if="dateError" class="text-xs text-red-500">{{ dateError }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5">
              <Label for="priority">Priority</Label>
              <select
                id="priority"
                v-model="form.priority"
                class="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/60"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="grid gap-1.5">
              <Label for="list">Category</Label>
              <select
                id="list"
                v-model="form.list"
                class="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/60"
              >
                <option v-for="l in lists" :key="l" :value="l">{{ l }}</option>
              </select>
            </div>
          </div>

          <div class="grid gap-1.5">
            <Label for="tags">Tags</Label>
            <Input id="tags" v-model="form.tags" placeholder="school, urgent (comma separated)" class="h-11 rounded-xl" />
          </div>
        </div>

        <DialogFooter class="mt-2 gap-2">
          <Button variant="outline" class="h-11 rounded-xl" @click="emit('cancel')">
            Cancel
          </Button>
          <Button
            class="h-11 rounded-xl text-white transition-all duration-150 active:scale-[0.98]"
            :class="isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-90'"
            style="background: linear-gradient(135deg, #1c7a6e 0%, #3fa0a0 100%);"
            :disabled="isDisabled"
            @click="emit('save')"
          >
            {{ editingId ? "Save changes" : "Add task" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>
