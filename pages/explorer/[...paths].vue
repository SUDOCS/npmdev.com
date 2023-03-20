<script setup lang="ts">
import mp3Svg from '@/assets/icons/mimetypes/application-m3u.svg?inline'
import rarSvg from '@/assets/icons/mimetypes/application-vnd.rar.svg?inline'
import msExeSvg from '@/assets/icons/mimetypes/application-x-ms-dos-executable.svg?inline'
import zipSvg from '@/assets/icons/mimetypes/application-zip.svg?inline'
import imageSvg from '@/assets/icons/mimetypes/image.svg?inline'
import txtSvg from '@/assets/icons/mimetypes/text-plain.svg?inline'
import unknownSvg from '@/assets/icons/mimetypes/unknown.svg?inline'
import folderSvg from '@/assets/icons/places/folder.svg?inline'
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
  return `/proxy/pan/api/v3/share/list/P4Cq/${paths.value.join('/')}`
})

const { data: dirData } = await useFetch(requestUrl)

const files = computed(() => {
  const { code, data } = dirData.value as any
  if (code === 0) {
    const { objects } = data ?? {}
    return objects
  }
})

const musicFiles = computed(() => {
  return files.value.filter((file: Record<string, any>) => file.type === 'file' && file.name.split('.').pop() === 'mp3')
})

function icon(file: Record<string, any>) {
  if (file.type === 'dir') {
    return folderSvg
  }

  const ext = file.name.split('.').pop()
  switch (ext) {
    case 'mp3':
      return mp3Svg
    case 'jpg':
    case 'png':
    case 'gif':
    case 'webp':
      return imageSvg
    case 'svg':
    case 'rar':
      return rarSvg
    case 'zip':
      return zipSvg
    case 'exe':
      return msExeSvg
    case 'txt':
      return txtSvg
    default:
      return unknownSvg
  }
}

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
            url: `//pan.npmdev.com/api/v3/share/preview/P4Cq?path=${encodeURIComponent(`/${to}`)}`,
          })),
        ),
      )

      // 设定当前要播放的音乐文件
      localStorage.setItem(CurrentMusicFileIdx, musicFiles.value.findIndex((f: Record<string, any>) => f.name === file.name))

      window.parent.postMessage({
        type: 'applet:mount',
        payload: 'music',
      })
    }
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
      <img :src="icon(file)" alt="">
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
