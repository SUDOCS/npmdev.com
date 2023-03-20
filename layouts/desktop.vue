<script setup lang="ts">
import { desktopApps } from '@/applets'
import loadingIllustration from '@/assets/illustrations/loading.svg?inline'
import Preference from '~~/utils/preference'

const appletStore = useAppletStore()
const musicStore = useMusicStore()
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
const wallpaperStore = useWallpaper()
const { currentWallpaper } = storeToRefs(wallpaperStore)

watch(currentWallpaper, () => {
  bgLoaded.value = false
  loadBackground()
})

const isLargeScreen = useMediaQuery('(min-width: 1024px)')
const contextMenuPosition = ref({ clientX: 0, clientY: 0 })
const showContextMenu = ref(false)

const menus = [
  {
    text: '🔄 刷新',
    func: () => {
      location.reload()
    },
  },
  {
    text: '🖼️ 切换壁纸',
    func: () => {
      wallpaperStore.nextWallpaper()
    },
  },
]

function loadBackground() {
  const img = new Image()
  const bg = currentWallpaper.value

  bgSrc.value = bg

  img.onload = () => {
    bgLoaded.value = true
  }

  img.src = bg
}

function listenFrame(data: MessageEvent) {
  const { type, payload } = data.data

  switch (type) {
    case 'applet:mount':{
      appletStore.mountApp(payload)
      break
    }
    case 'applet:unmount':{
      appletStore.unmountApp(payload)
      break
    }
  }
}

function onRightClick(e: MouseEvent) {
  e.preventDefault()
  contextMenuPosition.value = {
    clientX: e.clientX,
    clientY: e.clientY,
  }
  showContextMenu.value = true
}

function onDesktopClick() {
  showContextMenu.value = false
}

onMounted(() => {
  window.addEventListener('message', listenFrame)

  loadBackground()

  const HasShownComputerKey = 'has-shown-computer'

  if (isLargeScreen.value && !Preference.get(HasShownComputerKey)) {
    appletStore.mountApp('computer')
    // 一小时内不再显示
    Preference.set(HasShownComputerKey, true, 60 * 60)
  }
})

onUnmounted(() => {
  window.removeEventListener('message', listenFrame)
})
</script>

<template>
  <div
    key="desktop" w-100vw h-100vh relative overflow-hidden
    @click="onDesktopClick"
    @contextmenu="onRightClick"
  >
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

  <ContextMenu v-model:show="showContextMenu" :position="contextMenuPosition" :menus="menus" />
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
</style>
