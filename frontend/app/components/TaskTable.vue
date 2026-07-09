<script setup lang="ts">
import { ref, computed, watch } from "vue"
import type { Task } from "~/types/tasks.type"

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  edit: [task: Task]
  delete: [id: string]
  toggle: [id: string]
}>()

const currentPage = ref(1)
const itemsPerPage = 5

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return props.tasks.slice(start, end)
})

watch(() => props.tasks.length, (newLength) => {
  const totalPages = Math.ceil(newLength / itemsPerPage)
  if (currentPage.value > totalPages && totalPages > 0) {
    currentPage.value = totalPages
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
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
          <TableRow v-for="task in paginatedTasks" :key="task.id">
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

    <div v-if="tasks.length > itemsPerPage" class="flex justify-center mt-4">
      <Pagination
        :total="tasks.length"
        :items-per-page="itemsPerPage"
        :sibling-count="1"
        show-edges
        v-model:page="currentPage"
      >
        <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
          <PaginationFirst />
          <PaginationPrevious />

          <template v-for="(item, index) in items">
            <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" :is-active="item.value === currentPage" as-child>
              <Button class="w-9 h-9 p-0" :variant="item.value === currentPage ? 'default' : 'outline'">
                {{ item.value }}
              </Button>
            </PaginationItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>