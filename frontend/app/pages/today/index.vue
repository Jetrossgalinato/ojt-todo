<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useTasksStore } from "~/stores/tasks"
import TaskRow from "~/components/TaskRow.vue"
import TaskDialog from "~/pages/dashboard/components/TaskDialog.vue"
import type { TaskForm } from "~/types/tasks.type"

definePageMeta({ layout: "default" })

const store = useTasksStore()

onMounted(() => {
  store.fetchTasks()
})

const dialogOpen = ref(false)
const defaultDueDate = ref("")

const form = ref<TaskForm>({
  title: "",
  description: "",
  dueDate: "",
  dueTime: "",
  priority: "medium",
  tags: "",
  list: "Personal",
})

function openAddDialog() {
  const today = new Date().toISOString().split("T")[0]
  defaultDueDate.value = today
  form.value = {
    title: "",
    description: "",
    dueDate: today,
    dueTime: "",
    priority: "medium",
    tags: "",
    list: "Personal",
  }
  dialogOpen.value = true
}

function handleSave() {
  if (!form.value.title.trim()) return
  store.addTask({
    title: form.value.title,
    description: form.value.description,
    priority: form.value.priority,
    dueDate: form.value.dueDate,
    dueTime: form.value.dueTime,
    list: form.value.list,
  })
  dialogOpen.value = false
}

function handleToggle(id: string) {
  store.toggleComplete(id)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Today</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ store.todayCount }} {{ store.todayCount === 1 ? "task" : "tasks" }} due today
        </p>
      </div>
      <Button
        class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0"
        @click="openAddDialog"
      >
        + Add task
      </Button>
    </div>

    <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="w-10"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead class="text-right">Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="store.getTasksDueToday.length === 0">
            <TableRow>
              <TableCell :colspan="4" class="py-10 text-center text-sm text-muted-foreground">
                Nothing due today.
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow v-for="task in store.getTasksDueToday" :key="task.id">
              <TableCell :colspan="4" class="p-0">
                <TaskRow
                  :task="task"
                  :show-due="true"
                  @toggle="handleToggle"
                />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <TaskDialog
      v-model:open="dialogOpen"
      v-model:form="form"
      :editing-id="null"
      :lists="['Personal', 'Work', 'Errands']"
      @save="handleSave"
      @cancel="dialogOpen = false"
    />
  </div>
</template>
