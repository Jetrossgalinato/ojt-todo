<script setup lang="ts">
import { computed, ref, watch } from "vue"
import type { TaskItem } from "~/types/task-filters.type"

const props = defineProps<{
  tasks: TaskItem[]
  modelValue: string | null
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string | null]
}>()

const isOpen = ref(false)

const availableTags = computed(() => {
  const seen = new Set<string>()
  const result: string[] = []

  for (const task of props.tasks) {
    for (const tag of task.tags) {
      const name = tag.name.trim()
      if (!name || seen.has(name)) continue
      seen.add(name)
      result.push(name)
    }
  }

  return result
})

watch(
  availableTags,
  (tags) => {
    if (props.modelValue && !tags.includes(props.modelValue)) {
      emit("update:modelValue", null)
    }
  },
  { immediate: true }
)

function toggle() {
  isOpen.value = !isOpen.value
}

function selectTag(tag: string | null) {
  emit("update:modelValue", tag)
}
</script>

<template>
  <div>
    <div class="filter-toggle-row">
      <button
        type="button"
        class="filter-toggle-btn"
        :class="{ 'has-active': modelValue !== null }"
        @click="toggle"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4" aria-hidden="true">
          <path d="M4 5h16M7 12h10M10 19h4" />
        </svg>
        Filter
        <span v-if="modelValue !== null" class="filter-dot" aria-hidden="true" />
      </button>
    </div>

    <div
      v-if="availableTags.length > 0"
      class="tag-filter-row"
      :class="{ open: isOpen }"
    >
      <button
        type="button"
        class="tag-chip"
        :class="{ active: modelValue === null }"
        @click="selectTag(null)"
      >
        All
      </button>
      <button
        v-for="tag in availableTags"
        :key="tag"
        type="button"
        class="tag-chip"
        :class="{ active: modelValue === tag }"
        @click="selectTag(tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.filter-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border, #e6e4de);
  color: var(--text-secondary, #6b7570);
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.filter-toggle-btn:hover {
  background: #f0efe9;
}

.filter-toggle-btn.has-active {
  border-color: var(--teal-700, #0f6e56);
  color: var(--teal-700, #0f6e56);
  background: #e9f5f0;
}

.filter-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--teal-700, #0f6e56);
  display: inline-block;
}

.tag-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 0;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  pointer-events: none;
  transition: max-height 0.22s ease, opacity 0.18s ease, margin-bottom 0.22s ease;
}

.tag-filter-row.open {
  max-height: 180px;
  opacity: 1;
  pointer-events: auto;
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
  transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
  animation: chipIn 0.18s ease both;
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

@keyframes chipIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .filter-toggle-btn,
  .tag-chip,
  .tag-filter-row {
    transition: none !important;
    animation: none !important;
  }
}
</style>
