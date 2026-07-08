<script setup lang="ts">
import type { TaskForm } from "~/types/tasks.type"

defineProps<{
  lists: string[]
  editingId: number | null
}>()

const emit = defineEmits<{
  save: []
  cancel: []
}>()

const open = defineModel<boolean>("open", { required: true })
const form = defineModel<TaskForm>("form", { required: true })
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ editingId ? "Edit task" : "Add task" }}</DialogTitle>
      </DialogHeader>

      <div class="flex flex-col gap-3">
        <div class="grid gap-1.5">
          <Label for="title">Title</Label>
          <Input id="title" v-model="form.title" placeholder="Task title" />
        </div>

        <div class="grid gap-1.5">
          <Label for="description">Description / notes</Label>
          <textarea
            id="description"
            v-model="form.description"
            rows="2"
            placeholder="Optional notes..."
            class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1.5">
            <Label for="due-date">Due date</Label>
            <Input id="due-date" v-model="form.dueDate" type="date" />
          </div>
          <div class="grid gap-1.5">
            <Label for="due-time">Due time</Label>
            <Input id="due-time" v-model="form.dueTime" type="time" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="grid gap-1.5">
            <Label for="priority">Priority</Label>
            <select
              id="priority"
              v-model="form.priority"
              class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div class="grid gap-1.5">
            <Label for="list">List / category</Label>
            <select
              id="list"
              v-model="form.list"
              class="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40"
            >
              <option v-for="l in lists" :key="l" :value="l">{{ l }}</option>
            </select>
          </div>
        </div>

        <div class="grid gap-1.5">
          <Label for="tags">Tags</Label>
          <Input id="tags" v-model="form.tags" placeholder="school, urgent (comma separated)" />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('cancel')">Cancel</Button>
        <Button @click="emit('save')">{{ editingId ? "Save changes" : "Add task" }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>