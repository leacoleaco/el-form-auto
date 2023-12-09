<script setup>
import { onMounted, ref } from 'vue'

const text = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('https://v1.hitokoto.cn/?c=f&encode=text')
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
