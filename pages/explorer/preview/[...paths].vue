<script setup lang="ts">
definePageMeta({
  layout: 'explorer',
  title: '文件资源管理器',
})

const route = useRoute()
const paths = computed(() => {
  return route.params.paths as string[]
})
</script>

<template>
  {{ paths }}
</template>

<style lang="scss" scoped>
</style>
