<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import type { TaskForm, List } from "~/types/tasks.type"
import { useTasks } from "~/composables/useTasks"

defineProps<{
  editingId: string | null
}>()

const emit = defineEmits<{
  save: []
  cancel: []
}>()

const open = defineModel<boolean>("open", { required: true })
const form = defineModel<TaskForm>("form", { required: true })

const { fetchLists, createList } = useTasks()
const backendLists = ref<List[]>([])
const loading = ref(false)

const DEFAULT_NAMES = ["Work", "Personal", "Errands"]

async function ensureDefaultLists() {
  const existingNames = new Set(backendLists.value.map((l) => l.name.toLowerCase()))
  for (const name of DEFAULT_NAMES) {
    if (!existingNames.has(name.toLowerCase())) {
      try {
        const created = await createList(name)
        backendLists.value.push(created)
      } catch {
        // already exists or error — skip
      }
    }
  }
}

onMounted(async () => {
  loading.value = true
  try {
    backendLists.value = await fetchLists()
    await ensureDefaultLists()
  } catch {
    backendLists.value = []
  } finally {
    loading.value = false
  }
})
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
        </DialogHeader>

        <div class="flex flex-col gap-4">
          <div class="grid gap-1.5">
            <Label for="title">Title *</Label>
            <Input id="title" v-model="form.title" placeholder="Task title" class="h-11 rounded-xl" />
          </div>

          <div class="grid gap-1.5">
            <Label for="description">Description / notes</Label>
            <textarea
              id="description"
              v-model="form.description"
              rows="2"
              placeholder="Optional notes..."
              class="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-teal-500/60 transition-colors duration-150"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5">
              <Label for="due-date">Due date</Label>
              <Input id="due-date" v-model="form.dueDate" type="date" class="h-11 rounded-xl" />
            </div>
            <div class="grid gap-1.5">
              <Label for="due-time">Due time</Label>
              <Input id="due-time" v-model="form.dueTime" type="time" class="h-11 rounded-xl" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5">
              <Label for="priority">Priority</Label>
              <select
                id="priority"
                v-model="form.priority"
                class="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-teal-500/60 transition-colors duration-150"
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
                v-model="form.listId"
                class="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-teal-500/60 transition-colors duration-150"
              >
                <option value="">None</option>
                <option v-for="list in backendLists" :key="list.id" :value="list.id">
                  {{ list.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid gap-1.5">
            <Label for="tags">Tags</Label>
            <Input
              id="tags"
              v-model="form.tags"
              placeholder="Comma-separated tags..."
              class="h-11 rounded-xl"
            />
          </div>
        </div>

        <DialogFooter class="mt-2 gap-2">
          <Button variant="outline" class="h-11 rounded-xl animate-btn-press" @click="emit('cancel')">
            Cancel
          </Button>
          <Button
            class="h-11 rounded-xl text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style="background: linear-gradient(135deg, #1c7a6e 0%, #3fa0a0 100%);"
            @click="emit('save')"
          >
            {{ editingId ? "Save changes" : "Add task" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>
