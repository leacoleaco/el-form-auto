<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
        <path :fill="fill" d="M352 480h320a32 32 0 1 1 0 64H352a32 32 0 0 1 0-64z"/>
        <path :fill="fill" d="M480 672V352a32 32 0 1 1 64 0v320a32 32 0 0 1-64 0z"/>
        <path :fill="fill"
              d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896z"/>
    </svg>
</template>

<script>
export default {
  name: 'AddIcon',
  props: {
    fill: {
      type: String,
      default: '#17afff'
    }
  }
}
</script>

<style scoped>

</style>
