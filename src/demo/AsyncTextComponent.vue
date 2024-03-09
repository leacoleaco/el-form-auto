<script setup>
import { onMounted, ref, defineProps } from 'vue'

const props = defineProps({
  url: {
    type: String,
    required: true
  }
})

const text = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch(props.url)
    text.value = await res.text()
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <span v-loading="loading">{{ text }}</span>
</template>

<style scoped>

</style>
