<script setup lang="ts">
import type { Task } from "~/types/tasks.type"

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: string]
  toggle: [id: string]
}>()
</script>

<template>
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
      <template v-if="tasks.length === 0">
        <TableRow>
          <TableCell :colspan="7" class="text-center text-sm text-muted-foreground py-8">
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
              @change="emit('toggle', task.id)"
              class="h-4 w-4"
            />
          </TableCell>

          <TableCell>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <p
                  class="text-sm font-medium text-foreground"
                  :class="task.completed ? 'line-through text-muted-foreground' : ''"
                >
                  {{ task.title }}
                </p>
              </div>
              <p v-if="task.description" class="text-xs text-muted-foreground mt-0.5">
                {{ task.description }}
              </p>
            </div>
          </TableCell>

          <TableCell class="text-sm text-muted-foreground">{{ task.priority }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ task.list }}</TableCell>

          <TableCell class="text-sm text-muted-foreground">
            <div class="whitespace-nowrap">{{ task.dueDate }} {{ task.dueTime }}</div>
          </TableCell>

          <TableCell class="text-sm text-muted-foreground">{{ task.tags }}</TableCell>

          <TableCell class="text-right">
            <div class="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" @click="emit('edit', task)">Edit</Button>
              <Button variant="ghost" size="sm" @click="emit('delete', task.id)">Delete</Button>
            </div>
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>