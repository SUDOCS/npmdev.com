<script setup lang="ts">
import Artplayer from 'artplayer'
definePageMeta({
  layout: 'explorer',
  title: '文件资源管理器',
})

const route = useRoute()
const paths = computed(() => {
  return route.params.paths as string[]
})

const videoPlayer = ref()

let art

onMounted(() => {
  const file = paths.value[paths.value.length - 1]
  const ext = file.split('.').pop()

  if (ext === 'mp4') {
    art = new Artplayer({
      container: videoPlayer.value,
      url: decodeURIComponent(route.query.url as string),
    })
  }
})
</script>

<template>
  <div flex-center w-full h-90vh>
    <div ref="videoPlayer" w-full h-80vh />
  </div>
</template>

<style lang="scss" scoped>
</style>
