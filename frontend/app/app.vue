<script setup lang="ts">
import "vue-sonner/style.css"
import { Toaster, toast } from "vue-sonner"
import { ErrorIcon } from "@/lib/toast-icons"

const colorMode = useColorMode()
const route = useRoute()
const router = useRouter()

function handleToastQuery() {
  const type = route.query.toast
  if (!type) return

  if (type === 'access-denied') {
    toast.error('Access denied', {
      description: 'You must log in to access this page.',
      icon: ErrorIcon,
    })
  } else if (type === 'already-logged-in') {
    toast.error('Already logged in', {
      description: 'Redirecting you to your dashboard.',
      icon: ErrorIcon,
    })
  }

  const { toast: _removed, ...rest } = route.query
  router.replace({ query: rest })
}

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      handleToastQuery()
    }, 150)
  })
})

watch(() => route.query.toast, (val) => {
  if (val) handleToastQuery()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <Toaster
      :theme="colorMode.value as 'light' | 'dark' | 'system'"
      position="top-right"
      close-button
    />
  </ClientOnly>
</template>