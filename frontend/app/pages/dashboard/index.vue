<script setup lang="ts">
import { ref, computed } from "vue"
import type { Task, TaskForm } from "~/types/tasks.type"

const lists = ["Personal", "Work", "Errands"]

const tasks = ref<Task[]>([

])

const pendingCount = computed(() => tasks.value.filter((t) => !t.completed).length)

// Dialog + form state
const dialogOpen = ref(false)
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

function openAddDialog() {
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
  dialogOpen.value = true
}

function resetForm() {
  editingId.value = null
  dialogOpen.value = false
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
  dialogOpen.value = true
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
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">{{ pendingCount }} tasks pending</p>
      </div>
      <Button @click="openAddDialog">+ Add Task</Button>
    </div>

    <!-- Add / Edit Task Dialog -->
    <Dialog v-model:open="dialogOpen">
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
          <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
          <Button @click="saveTask">{{ editingId ? "Save changes" : "Add task" }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Task list -->
    <Table>
      <TableHeader>
        <TableRow>
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
        <TableRow v-for="task in tasks" :key="task.id">
          <TableCell>
            <input
              type="checkbox"
              :checked="task.completed"
              @change="toggleComplete(task.id)"
            />
          </TableCell>
          <TableCell>
            <p
              class="text-sm font-medium text-foreground"
              :class="task.completed ? 'line-through text-muted-foreground' : ''"
            >
              {{ task.title }}
            </p>
            <p v-if="task.description" class="text-xs text-muted-foreground mt-0.5">
              {{ task.description }}
            </p>
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ task.priority }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ task.list }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ task.dueDate }} {{ task.dueTime }}
          </TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ task.tags }}</TableCell>
          <TableCell class="text-right">
            <Button variant="ghost" size="sm" @click="editTask(task)">Edit</Button>
            <Button variant="ghost" size="sm" @click="deleteTask(task.id)">Delete</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>