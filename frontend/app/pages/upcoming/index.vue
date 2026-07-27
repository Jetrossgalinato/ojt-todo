<script setup lang="ts">
import { onMounted } from "vue"
import { useTasksStore } from "~/stores/tasks"
import TaskRow from "~/components/TaskRow.vue"
import TaskDialog from "~/pages/dashboard/components/TaskDialog.vue"

definePageMeta({ layout: "default" })

const store = useTasksStore()

onMounted(() => {
  if (!store.tasks.length) store.fetchTasks()
})

const dialogOpen = ref(false)

function openAddDialog() {
  dialogOpen.value = true
}

function handleToggle(id: string) {
  store.toggleComplete(id)
}

function formatSectionDate(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase()
  const day = d.getDate()
  return `${month} ${day}`
}

function getTomorrowLabel(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatSectionDate(tomorrow.toISOString().split("T")[0])
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 sm:p-8 max-w-5xl mx-auto w-full">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">Upcoming</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ store.upcomingCount }} {{ store.upcomingCount === 1 ? "task" : "tasks" }} scheduled
        </p>
      </div>
      <Button
        class="rounded-full px-4 py-1.5 text-xs h-auto bg-teal-700 hover:bg-teal-800 text-white border-0"
        @click="openAddDialog"
      >
        + Add task
      </Button>
    </div>

    <template v-if="store.getUpcomingTasks.tomorrow.length">
      <div>
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Tomorrow &middot; {{ getTomorrowLabel() }}
        </p>
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
              <TableRow v-for="task in store.getUpcomingTasks.tomorrow" :key="task.id">
                <TableCell :colspan="4" class="p-0">
                  <TaskRow :task="task" :show-due="true" @toggle="handleToggle" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </template>

    <template v-if="store.getUpcomingTasks.thisWeek.length">
      <div>
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          This Week
        </p>
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
              <TableRow v-for="task in store.getUpcomingTasks.thisWeek" :key="task.id">
                <TableCell :colspan="4" class="p-0">
                  <TaskRow :task="task" :show-due="true" @toggle="handleToggle" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </template>

    <template v-if="store.getUpcomingTasks.later.length">
      <div>
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Later
        </p>
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
              <TableRow v-for="task in store.getUpcomingTasks.later" :key="task.id">
                <TableCell :colspan="4" class="p-0">
                  <TaskRow :task="task" :show-due="true" @toggle="handleToggle" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </template>

    <template v-if="store.upcomingCount === 0">
      <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
        <div class="py-10 text-center text-sm text-muted-foreground">
          No upcoming tasks
        </div>
      </div>
    </template>

    <TaskDialog
      v-model:open="dialogOpen"
      :editing-id="null"
      :lists="['Personal', 'Work', 'Errands']"
      @save="dialogOpen = false"
      @cancel="dialogOpen = false"
    />
  </div>
</template>
