<script setup lang="ts">
import { onMounted } from "vue"
import { toast } from "vue-sonner"
import { useTasksStore } from "~/stores/tasks"
import TaskRow from "~/components/TaskRow.vue"

definePageMeta({ layout: "default" })

const store = useTasksStore()

onMounted(() => {
  if (!store.tasks.length) store.fetchTasks()
})

function handleUndo(id: string) {
  store.toggleComplete(id)
  toast.success("Task restored")
}

function handleClearAll() {
  if (!confirm("Are you sure you want to clear all completed tasks?")) return
  store.clearCompleted()
  toast.success("Completed tasks cleared")
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Completed</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ store.completedCount }} {{ store.completedCount === 1 ? "task" : "tasks" }} completed
        </p>
      </div>
      <Button
        v-if="store.completedCount > 0"
        variant="outline"
        class="rounded-full px-4 py-1.5 text-xs h-auto border-gray-300 text-gray-600 hover:bg-gray-50"
        @click="handleClearAll"
      >
        Clear all
      </Button>
    </div>

    <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead class="w-10"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="store.getCompletedTasks.length === 0">
            <TableRow>
              <TableCell :colspan="4" class="py-10 text-center text-sm text-muted-foreground">
                No completed tasks
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow v-for="task in store.getCompletedTasks" :key="task.id">
              <TableCell :colspan="4" class="p-0">
                <TaskRow
                  :task="task"
                  :show-undo="true"
                  @toggle="handleUndo"
                  @undo="handleUndo"
                />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
