<script setup lang="ts">
import wallpapers from 'virtual:wallpaper-auto-scanner'
import { desktopApps } from '@/applets'

const appletStore = useAppletStore()
const { mountedApps } = storeToRefs(appletStore)

const apps = computed(() => {
  return desktopApps.filter((app) => {
    return mountedApps.value.includes(app.name)
  })
})

// https://images.unsplash.com/photo-1509565840034-3c385bbe6451?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&q=50

const route = useRoute()

useHead({
  title: route.meta.title as unknown as string,
})
</script>

<template>
  <div w-100vw h-100vh relative overflow-hidden>
    <DesktopGrid />
    <DesktopDock />

    <ClientOnly>
      <DesktopWindow v-for="app in apps" :key="app.name" :config="app" />
    </ClientOnly>

    <div fixed top-0 bottom-0 right-0 left-0 z--1>
      <img
        w-full h-full object-cover class="animate-[bganim_60s_linear_infinite] lg:animate-none"
        :src="wallpapers[Math.ceil(Math.random() * wallpapers.length) - 1]"
      >
    </div>
  </div>
</template>

<style lang="scss">
@keyframes bganim {
  0% {
    object-position: left top;
  }

  100%{
    object-position: right bottom;
  }
}
</style>
