<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'

const colorMode = useColorMode()

const options = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
]
</script>

<template>
  <div class="flex gap-1 px-3">
    <button
      v-for="option in options"
      :key="option.value"
      class="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-colors"
      :class="
        colorMode.preference === option.value
          ? 'border border-white/25 bg-white/[0.12] text-white'
          : 'border border-transparent text-sidebar-primary-foreground/80 hover:bg-white/10 hover:text-sidebar-primary-foreground'
      "
      @click="colorMode.preference = option.value"
    >
      <component :is="option.icon" class="h-4 w-4" />
      {{ option.label }}
    </button>
  </div>
</template>
