<script setup lang="ts">
defineProps<{
  label?: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    type="button"
    class="ecommerce-btn"
    @click="emit('click')"
  >
    {{ label || 'Add to Cart' }}
  </button>
</template>

<style scoped>
.ecommerce-btn {
  background-color: #16a34a;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
.ecommerce-btn:hover {
  background-color: #15803d;
}
</style>