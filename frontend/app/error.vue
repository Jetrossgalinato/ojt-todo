<script setup lang="ts">
import { toast } from 'vue-sonner'
import { ErrorIcon } from '@/lib/toast-icons'

const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}>()

const isNotFound = props.error.statusCode === 404

onMounted(() => {
  if (isNotFound) {
    toast.error('Page not found', {
      description: `The page ${window.location.pathname} does not exist.`,
      icon: ErrorIcon,
    })
  } else {
    toast.error('Something went wrong', {
      description: props.error.statusMessage || 'An unexpected error occurred.',
      icon: ErrorIcon,
    })
  }
})

function goHome() {
  clearError({ redirect: '/login' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
    <h1 class="text-6xl font-bold text-foreground">
      {{ error.statusCode }}
    </h1>
    <p class="text-lg text-muted-foreground">
      {{ isNotFound ? "This page doesn't exist." : (error.statusMessage || 'Something went wrong.') }}
    </p>
    <Button class="mt-4" @click="goHome">
      Back to Login
    </Button>
  </div>
</template>