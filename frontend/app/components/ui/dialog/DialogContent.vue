<script setup lang="ts">
import { DialogContent } from "reka-ui"
</script>

<template>
  <DialogContent class="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg">
    <slot />
  </DialogContent>
</template>
