<script setup lang="ts">
import type { AppletConfig } from '@/applets/type'

const props = withDefaults(defineProps<{
  config: AppletConfig
  width?: number
  height?: number
}>(), {
  width: 360,
  height: 640,
})

const appletStore = useAppletStore()
const { unmountApp, clearActiveApp, refreshAppIndex } = appletStore
const zIndex = ref(refreshAppIndex())

const isLargeScreen = useMediaQuery('(min-width: 1024px)')

const windowEl = ref(null)
const width = ref(props.width)
const height = ref(props.height)
const top = ref(window.innerHeight / 2 - height.value / 2)
const left = ref(window.innerWidth / 2 - width.value / 2)

const dragging = ref(false)

enum WindowState {
  Normal,
  Maximized,
  Minimized,
  Closed,
}

enum WindowAction {
  Minimize,
  Maximize,
  Unmaximize,
  Close,
}

const state = ref(WindowState.Normal)
const oldState = ref(WindowState.Normal)

const maximizedStyle = () => ({
  top: '0px',
  bottom: '0px',
  left: '0px',
  right: '0px',
  width: '100vw',
  height: '100vh',
  transform: 'none',
  borderRadius: '0px',
  transition: 'all 150ms ease-out',
  zIndex: zIndex.value,
})

const normalStyle = () => ({
  top: `${top.value}px`,
  left: `${left.value}px`,
  width: `${width.value}px`,
  height: `${height.value}px`,
  transform: 'none',
  transition: 'all 150ms ease-out',
  zIndex: zIndex.value,
})

const minimizedStyle = () => ({
  top: '100%',
  left: '50%',
  transform: 'translate(-50%, 0) scale(0.1)',
  transition: 'all 500ms ease-out',
  zIndex: zIndex.value,
})

const closedStyle = () => {
  const rect = (windowEl.value as unknown as HTMLElement).getBoundingClientRect()
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    transform: 'scale(0)',
    transformOrigin: 'center center',
    transition: 'all 300ms ease-out',
    zIndex: zIndex.value,
  }
}

const style = computed(() => {
  if (!isLargeScreen.value && state.value !== WindowState.Closed) {
    return maximizedStyle()
  }

  if (dragging.value) {
    return { ...normalStyle(), transition: 'none' }
  }

  switch (state.value) {
    case WindowState.Normal:
      return normalStyle()
    case WindowState.Maximized:
      return maximizedStyle()
    case WindowState.Minimized:
      return minimizedStyle()
    case WindowState.Closed:
      return closedStyle()
  }
})

const stopWatchActiveApp = watchEffect(() => {
  if (appletStore.activeApp === props.config.name) {
    if (state.value === WindowState.Minimized) {
      state.value = oldState.value
    }
  }
})

onUnmounted(() => {
  stopWatchActiveApp()
})

function doWindowAction(action: WindowAction) {
  oldState.value = state.value
  switch (action) {
    case WindowAction.Minimize:
      state.value = WindowState.Minimized
      clearActiveApp()
      break
    case WindowAction.Maximize:
      state.value = WindowState.Maximized
      break
    case WindowAction.Unmaximize:
      state.value = WindowState.Normal
      break
    case WindowAction.Close:
      state.value = WindowState.Closed

      // 延时卸载，否则动画不显示
      setTimeout(() => {
        // 卸载
        unmountApp(props.config.name)
      }, 300)
      break
  }
}

const mouseDown = (e: MouseEvent) => {
  e.preventDefault()
  dragging.value = true
  zIndex.value = refreshAppIndex()
  const { clientX, clientY } = e

  const { top: windowTop, left: windowLeft } = (windowEl.value as unknown as HTMLElement).getBoundingClientRect()
  let offsetX = clientX - windowLeft
  let offsetY = clientY - windowTop

  // 当鼠标相对窗口位置超过窗口宽度时（最大化转正常状态），需要按比例转换，必然鼠标会在窗口外
  if (offsetX > width.value) {
    offsetX *= width.value / window.innerWidth
    offsetY *= height.value / window.innerHeight
  }

  const drag = (e: MouseEvent) => {
    const { clientX, clientY } = e
    top.value = clientY - offsetY
    left.value = clientX - offsetX

    if (top.value < 0) {
      top.value = 0
      state.value = WindowState.Maximized
    }
    else {
      state.value = WindowState.Normal
    }
  }

  const dragEnd = () => {
    dragging.value = false
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('mouseup', dragEnd)
  }

  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', dragEnd)
}
</script>

<template>
  <div
    ref="windowEl" bg="#fff/70" shadow border border-solid border-gray-200
    class="absolute-full lg:(w-360px h-640px absolute-center) fcol rounded-none md:rounded-12px"
    :style="style"
    @click.stop="zIndex = refreshAppIndex()"
  >
    <div absolute top-0 left-0 right-0 h-42px frow justify-between select-none rounded-t-none md:rounded-t-12px>
      <!-- 图标和名称 -->
      <div frow justify-between pl-12px text-15px flex-gap-6px hover:contrast-200>
        <img :src="config.icon" alt="" w-24px h-24px>
        <span>{{ config.title }}</span>
      </div>
      <!-- 拖拽区域 -->
      <div flex-1 h-full cursor-move @mousedown.stop="mouseDown" />
      <!-- 按钮 -->
      <div frow>
        <!-- 最小化 -->
        <div class="window-btn" @click="doWindowAction(WindowAction.Minimize)">
          <Icon name="fluent:minimize-24-regular" />
        </div>
        <!-- 取消最大化 -->
        <div v-if="state !== WindowState.Normal" class="hidden lg:block window-btn" @click="doWindowAction(WindowAction.Unmaximize)">
          <Icon name="fluent:full-screen-minimize-20-regular" />
        </div>
        <!-- 最大化 -->
        <div v-if="state !== WindowState.Maximized" class="hidden lg:block window-btn" @click="doWindowAction(WindowAction.Maximize)">
          <Icon name="fluent:full-screen-maximize-20-regular" />
        </div>
        <!-- 关闭 -->
        <div class="window-btn" @click="doWindowAction(WindowAction.Close)">
          <Icon name="clarity:window-close-line" />
        </div>
      </div>
    </div>
    <!-- 占标题栏的位置 -->
    <div h-42px />

    <div flex-1 w-full />
  </div>
</template>

<style lang="scss" scoped>
.window-btn{
  @apply h-42px w-42px lh-42px text-center hover:bg-#000/10 last:rounded-tr-12px;
}
</style>
