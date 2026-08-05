<script setup lang="ts">
import type { Tag } from "~/composables/useTags"

const props = defineProps<{
  tags: Tag[]
}>()

const selectedTag = defineModel<string | null>("selectedTag", { required: true })

function clear() {
  selectedTag.value = null
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Label for="tag-filter" class="text-sm text-muted-foreground whitespace-nowrap">
      Filter by tag
    </Label>
    <select
      id="tag-filter"
      v-model="selectedTag"
      class="h-9 max-w-[200px] rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-teal-500/60"
    >
      <option :value="null">All tags</option>
      <option v-for="tag in props.tags" :key="tag.id" :value="tag.name">
        {{ tag.name }}{{ tag._count ? ` (${tag._count.tasks})` : "" }}
      </option>
    </select>
    <Button v-if="selectedTag" variant="ghost" size="sm" class="rounded-lg" @click="clear">
      Clear
    </Button>
  </div>
</template>
