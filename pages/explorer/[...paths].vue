<script setup lang="ts">
import emptyIllustration from '@/assets/illustrations/empty.svg?inline'

definePageMeta({
  layout: 'explorer',
  title: '文件资源管理器',
})

const route = useRoute()
const router = useRouter()
const paths = computed(() => {
  return route.params.paths as string[]
})

const explorerStore = useExplorerStore()
const { listStyle } = storeToRefs(explorerStore)

const requestUrl = computed(() => {
  return `/api/oss/list/${paths.value.join('/')}`
})

const { data: files } = await useFetch<Record<string, any>[]>(requestUrl)

const musicFiles = computed(() => {
  return files.value?.filter((file: Record<string, any>) => file.type === 'file' && file.name.split('.').pop() === 'mp3') || []
})

function onFileClick(file: Record<string, any>) {
  const to = `${paths.value.join('/')}/${file.name}`
  if (file.type === 'file') {
    const ext = file.name.split('.').pop()

    const notInFrame = window.parent !== window
    if (ext === 'mp3' && notInFrame) {
      // 设定当前要播放的音乐列表
      localStorage.setItem(
        NetworkMusicListStorgeKey,
        JSON.stringify(
          musicFiles.value.map((file: Record<string, any>) => ({
            name: file.name,
            // url: `/proxy/pan/api/v3/share/preview/P4Cq?path=${encodeURIComponent(`/${to}`)}`,
            url: file.url,
          })),
        ),
      )

      // 设定当前要播放的音乐文件
      localStorage.setItem(CurrentMusicFileIdx, `${musicFiles.value.findIndex((f: Record<string, any>) => f.name === file.name)}`)

      window.parent.postMessage({
        type: 'applet:mount',
        payload: 'music',
      })

      return
    }
    console.log(file.url)

    router.push(`/explorer/preview/${to}?url=${encodeURIComponent(file.url)}`)
  }
  else {
    router.push(`/explorer/${to}`)
  }
}
</script>

<template>
  <div
    :class="{
      'explorer-entry-list-block': listStyle === 'block',
      'explorer-entry-list-detail': listStyle === 'detail',
    }"
  >
    <div
      v-for="file in files" :key="file.id" class="explorer-entry"
      @click="onFileClick(file)"
    >
      <img :src="getIconWithFile(file)" alt="">
      <div class="explorer-entry-space-detail">
        <div>{{ file.name }}</div>
      </div>
    </div>
  </div>
  <div v-show="!files || files.length === 0" w-full h-full flex-center>
    <img :src="emptyIllustration" alt="" w-80 h-80>
  </div>
</template>

<style lang="scss" scoped>
</style>
