<script setup lang="ts">
import type { Task } from "~/types/tasks.type"

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: number]
  toggle: [id: number]
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
      <TableRow v-for="task in tasks" :key="task.id">
        <TableCell>
          <input
            type="checkbox"
            :checked="task.completed"
            @change="emit('toggle', task.id)"
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
          <Button variant="ghost" size="sm" @click="emit('edit', task)">Edit</Button>
          <Button variant="ghost" size="sm" @click="emit('delete', task.id)">Delete</Button>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>