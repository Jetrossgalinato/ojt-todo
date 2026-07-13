<script setup lang="ts">
import "vue-sonner/style.css"
import { Toaster } from "@/components/ui/sonner"

const colorMode = useColorMode()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <Toaster :theme="colorMode.value as 'light' | 'dark' | 'system'" position="top-right" />
  </ClientOnly>
</template>
