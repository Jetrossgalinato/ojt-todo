<script setup lang="ts">
defineProps<{
  tags: string[]
  selected: string | null
}>()

const emit = defineEmits<{
  select: [tag: string | null]
}>()
</script>

<template>
  <div>
    <div class="tag-filter-row open">
      <button
        class="tag-chip"
        :class="{ active: selected === null }"
        @click="emit('select', null)"
      >
        All
      </button>
      <button
        v-for="tag in tags"
        :key="tag"
        class="tag-chip"
        :class="{ active: selected === tag }"
        @click="emit('select', tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tag-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag-chip {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--border, #e6e4de);
  background: #fff;
  color: var(--text-secondary, #6b7570);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
}

.tag-chip:hover {
  background: #f0efe9;
  transform: translateY(-1px);
}

.tag-chip.active {
  background: var(--teal-700, #0f6e56);
  color: #fff;
  border-color: var(--teal-700, #0f6e56);
}

@media (prefers-reduced-motion: reduce) {
  .tag-chip {
    transition: none !important;
  }
}
</style>