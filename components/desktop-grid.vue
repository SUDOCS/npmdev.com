<script setup lang="ts">
import { desktopApps } from '@/applets'

const isLargeScreen = useMediaQuery('(min-width: 1024px)')

const appletStore = useAppletStore()
const { mountApp } = appletStore

const onEntryClick = (app: string) => {
  if (!isLargeScreen.value) {
    mountApp(app)
  }
}

const onEntryDbClick = (appName: string) => {
  mountApp(appName)
}
</script>

<template>
  <div
    w="full" h="[calc(100vh-80px)]" p-12px
    grid="~ cols-[repeat(auto-fill,72px)] rows-[repeat(auto-fill,108px)] flow-col" gap-x-12px
  >
    <div
      v-for="app in desktopApps" :key="app.name"
      select-none flex-center flex-col rounded-6px p-12px font-bold
      hover="bg-[#0081ff33]" transition-colors active="bg-[#0081ff66]"
      @dblclick="onEntryDbClick(app.name)"
      @click="onEntryClick(app.name)"
    >
      <img h-48px w-48px object-contain :src="app.icon" :alt="app.title">
      <span text-white text-13px text-center w-72px text-owt break-words>
        {{ app.title }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
