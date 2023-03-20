<script setup lang="ts">
import mp3Svg from '@/assets/icons/mimetypes/application-m3u.svg?inline'
import rarSvg from '@/assets/icons/mimetypes/application-vnd.rar.svg?inline'
import msExeSvg from '@/assets/icons/mimetypes/application-x-ms-dos-executable.svg?inline'
import zipSvg from '@/assets/icons/mimetypes/application-zip.svg?inline'
import imageSvg from '@/assets/icons/mimetypes/image.svg?inline'
import txtSvg from '@/assets/icons/mimetypes/text-plain.svg?inline'
import unknownSvg from '@/assets/icons/mimetypes/unknown.svg?inline'

import emptyIllustration from '@/assets/illustrations/empty.svg?inline'

definePageMeta({
  layout: 'explorer',
  title: '文件资源管理器',
})

const route = useRoute()

const explorerStore = useExplorerStore()
const { listStyle } = storeToRefs(explorerStore)

const path = computed(() => {
  return `/proxy/pan/api/v3/share/list/P4Cq/${(route.params.dirs as string[]).join('/')}`
})

const { data: dirData } = await useFetch(path)

const files = computed(() => {
  const { code, data } = dirData.value as any
  if (code === 0) {
    const { objects } = data ?? {}
    return objects
  }
})

function icon(filename: string) {
  const ext = filename.split('.').pop()
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
</script>

<template>
  <div
    :class="{
      'explorer-entry-list-block': listStyle === 'block',
      'explorer-entry-list-detail': listStyle === 'detail',
    }"
  >
    <NuxtLink v-for="file in files" :key="file.id" class="explorer-entry" to="/explorer/desktop">
      <img :src="icon(file.name)" alt="">
      <div class="explorer-entry-space-detail">
        <div>{{ file.name }}</div>
      </div>
    </NuxtLink>
  </div>
  <div v-show="!files || files.length === 0" w-full h-full flex-center>
    <img :src="emptyIllustration" alt="" w-80 h-80>
  </div>
</template>

<style lang="scss" scoped>
</style>
