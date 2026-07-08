<script setup lang="ts">
import { ref, computed } from "vue"

interface Task {
  id: number
  title: string
  description: string
  dueDate: string
  dueTime: string
  priority: "low" | "medium" | "high"
  tags: string
  list: string
  completed: boolean
}

type TaskForm = Omit<Task, "id" | "completed">

const lists = ["Personal", "Work", "Errands"]

const tasks = ref<Task[]>([

])

const pendingCount = computed(() => tasks.value.filter((t) => !t.completed).length)

// Form state (used for both add and edit)
const editingId = ref<number | null>(null)

const form = ref<TaskForm>({
  title: "",
  description: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
  tags: "",
  list: lists[0],
})

function resetForm() {
  editingId.value = null
  form.value = {
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    tags: "",
    list: lists[0],
  }
}

function editTask(task: Task) {
  editingId.value = task.id
  form.value = {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    dueTime: task.dueTime,
    priority: task.priority,
    tags: task.tags,
    list: task.list,
  }
}

function saveTask() {
  if (!form.value.title.trim()) return

  if (editingId.value) {
    const task = tasks.value.find((t) => t.id === editingId.value)
    if (task) Object.assign(task, form.value)
  } else {
    tasks.value.unshift({
      ...form.value,
      id: Date.now(),
      completed: false,
    })
  }
  resetForm()
}

function deleteTask(id: number) {
  tasks.value = tasks.value.filter((t) => t.id !== id)
}

function toggleComplete(id: number) {
  const task = tasks.value.find((t) => t.id === id)
  if (task) task.completed = !task.completed
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8">
    <div>
      <h1 class="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p class="text-sm text-muted-foreground mt-1">{{ pendingCount }} tasks pending</p>
    </div>

    <!-- Add / Edit form -->
    <div class="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <p class="text-sm font-medium text-foreground">
        {{ editingId ? "Edit task" : "Add task" }}
      </p>

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

      <div class="flex gap-2 mt-1">
        <Button @click="saveTask">{{ editingId ? "Save changes" : "Add task" }}</Button>
        <Button v-if="editingId" variant="outline" @click="resetForm">Cancel</Button>
      </div>
    </div>

    <!-- Task list -->
    <div class="flex flex-col gap-2">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
      >
        <input
          type="checkbox"
          class="mt-1"
          :checked="task.completed"
          @change="toggleComplete(task.id)"
        />

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <p
              class="text-sm font-medium text-foreground"
              :class="task.completed ? 'line-through text-muted-foreground' : ''"
            >
              {{ task.title }}
            </p>
            <div class="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" @click="editTask(task)">Edit</Button>
              <Button variant="ghost" size="sm" @click="deleteTask(task.id)">Delete</Button>
            </div>
          </div>

          <p v-if="task.description" class="text-sm text-muted-foreground mt-1">
            {{ task.description }}
          </p>

          <div class="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>{{ task.priority }} priority</span>
            <span>·</span>
            <span>{{ task.list }}</span>
            <span v-if="task.dueDate">· Due {{ task.dueDate }} {{ task.dueTime }}</span>
            <span v-if="task.tags">· {{ task.tags }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>