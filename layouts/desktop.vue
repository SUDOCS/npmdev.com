<script setup lang="ts">
import wallpapers from 'virtual:wallpaper-auto-scanner'
import { desktopApps } from '@/applets'
import loadingIllustration from '@/assets/illustrations/loading.svg?inline'

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

const bgLoaded = ref(false)
const bgSrc = ref('')

function loadBackground() {
  const img = new Image()
  const bg = wallpapers[6]

  img.onload = () => {
    bgLoaded.value = true
    bgSrc.value = bg
  }

  img.src = bg
}

const isLargeScreen = useMediaQuery('(min-width: 1024px)')

onMounted(() => {
  loadBackground()
  if (isLargeScreen.value) {
    appletStore.mountApp('computer')
  }
})
</script>

<template>
  <div v-show="bgLoaded" key="desktop" w-100vw h-100vh relative overflow-hidden>
    <DesktopGrid />
    <DesktopDock />

    <ClientOnly>
      <DesktopWindow v-for="app in apps" :key="app.name" :config="app" />
    </ClientOnly>

    <div fixed top-0 bottom-0 right-0 left-0 z--1>
      <img
        w-full h-full object-cover class="animate-[bganim_60s_linear_infinite] lg:animate-none"
        :src="bgSrc"
      >
    </div>
  </div>

  <Transition name="fade">
    <div v-show="!bgLoaded" key="loading" flex-center absolute-full bg-white>
      <img :src="loadingIllustration" alt="" w-240px h-240px class="animate-[bgloading_1.5s_ease-in-out_infinite]">
    </div>
  </Transition>
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

@keyframes bgloading {
  0%{
    transform: translateY(-10%);
  }

  50%{
    transform: translateY(10%);
  }

  100%{
    transform: translateY(-10%);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
