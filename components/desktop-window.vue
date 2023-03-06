<script setup lang="ts">
import type { AppletConfig } from '@/applets/type'
import { toPixelVal } from '@/utils/pixel'

const props = defineProps<{
  config: AppletConfig
}>()

const appletStore = useAppletStore()
const { unmountApp, clearActiveApp, refreshAppIndex } = appletStore
const zIndex = ref(refreshAppIndex())

const isLargeScreen = useMediaQuery('(min-width: 1024px)')

const windowEl = ref(null)
const width = ref(props.config.windowWidth || '96vh')
const height = ref(props.config.windowHeight || '54vh')
const top = ref(`calc(50% - ${height.value} / 2)`)
const left = ref(`calc(50% - ${width.value} / 2)`)

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
const iframeLoaded = ref(false)

const baseStyle = {
  backgroundColor: props.config.backgroundColor || 'whitesmoke',
}

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
  top: top.value,
  left: left.value,
  width: width.value,
  height: height.value,
  transform: 'none',
  transition: 'all 150ms ease-out',
  zIndex: zIndex.value,
})

const minimizedStyle = () => ({
  top: '100%',
  left: '50%',
  width: width.value,
  height: height.value,
  transform: 'translate(-50%, 0) scale(0)',
  transformOrigin: 'center top',
  transition: 'all 300ms ease-out',
  zIndex: zIndex.value,
})

const closedStyle = () => {
  const rect = (windowEl.value as unknown as HTMLElement).getBoundingClientRect()
  return {
    top: `${rect.top}px`,
    left: `${rect.left}px`,
    width: width.value,
    height: height.value,
    transform: 'scale(0)',
    transformOrigin: 'center center',
    transition: 'all 150ms ease-out',
    zIndex: zIndex.value,
  }
}

const style = computed(() => {
  if (!isLargeScreen.value) {
    // 如果不是 PC 端
    switch (state.value) {
      case WindowState.Minimized:
        return minimizedStyle()
      case WindowState.Closed:
        return closedStyle()
      default:
        return maximizedStyle()
    }
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
  zIndex.value = refreshAppIndex()
  const { clientX, clientY } = e

  const { top: windowTop, left: windowLeft } = (windowEl.value as unknown as HTMLElement).getBoundingClientRect()
  let offsetX = clientX - windowLeft
  let offsetY = clientY - windowTop

  // 最大化转正常状态，需要按比例转换，不然鼠标可能飘会在窗口外
  if (state.value === WindowState.Maximized) {
    // width.value 是字符串，单位可能不是像素，需要转换
    offsetX *= toPixelVal(width.value) / window.innerWidth
    offsetY *= toPixelVal(height.value) / window.innerHeight
  }

  // 鼠标按下去，还没开始拖动就要更新top和left，否则从最大化状态下拖动时，刚开始时会有一段距离的抖动
  top.value = `${clientY - offsetY}px`
  left.value = `${clientX - offsetX}px`
  // dragging 为 true 时，style 计算属性更新，要先更新好 top 和 left
  dragging.value = true

  const drag = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const topVal = clientY - offsetY
    top.value = `${topVal}px`
    left.value = `${clientX - offsetX}px`

    if (topVal < 0) {
      top.value = '0px'
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

function onIframeLoad() {
  setTimeout(() => {
    iframeLoaded.value = true
  }, 300)
}
</script>

<template>
  <div
    ref="windowEl" bg="#fff/70" shadow border border-solid border-gray-200
    class="window absolute-full lg:(w-360px h-640px absolute-center) fcol rounded-none lg:rounded-xl"
    :style="{ ...baseStyle, ...style }"
    @click.stop="zIndex = refreshAppIndex()"
  >
    <!-- 标题栏底部蒙层 -->
    <div absolute top-0 left-0 right-0 h-42px bg-gradient-to-b from-white:70 to-white:10 blur-1px rounded-t-none lg:rounded-t-xl z-1 />

    <div
      absolute top-0 left-0 right-0 h-42px frow justify-between select-none rounded-t-none lg:rounded-t-xl
      transition-all duration-300 z-2
    >
      <!-- 图标和名称 -->
      <div frow justify-between pl-12px text-15px flex-gap-6px hover:contrast-200>
        <img :src="config.icon" alt="" w-24px h-24px>
        <ClientOnly>
          <span>{{ config.title }}</span>
        </ClientOnly>
      </div>
      <!-- 拖拽区域 -->
      <div flex-1 h-full cursor-move @mousedown.stop="mouseDown" />
      <!-- 按钮 -->
      <div frow>
        <!-- 最小化 -->
        <div v-if="config.enableMinimize" title="最小化" class="window-btn" @click="doWindowAction(WindowAction.Minimize)">
          <Icon name="fluent:minimize-24-regular" />
        </div>
        <!-- 取消最大化 -->
        <div v-if="config.enableMaximize && state !== WindowState.Normal" title="取消最大化" class="hidden lg:block window-btn" @click="doWindowAction(WindowAction.Unmaximize)">
          <Icon name="fluent:full-screen-minimize-20-regular" />
        </div>
        <!-- 最大化 -->
        <div v-if="config.enableMaximize && state !== WindowState.Maximized" title="最大化" class="hidden lg:block window-btn" @click="doWindowAction(WindowAction.Maximize)">
          <Icon name="fluent:full-screen-maximize-20-regular" />
        </div>
        <!-- 关闭 -->
        <div class="window-btn" title="关闭" @click="doWindowAction(WindowAction.Close)">
          <Icon name="clarity:window-close-line" />
        </div>
      </div>
    </div>
    <!-- 占标题栏的位置 -->
    <div v-if="!config.customTitleBar" h-42px />

    <div flex-1 w-full relative>
      <!-- 开屏幕画面 -->

      <Transition name="fade">
        <div
          v-if="!iframeLoaded"
          absolute-full flex-center bg-white :class="{ 'rounded-xl': config.customTitleBar && isLargeScreen }"
        >
          <img :src="config.icon" class="splash-icon">
        </div>
      </Transition>
      <iframe :src="config.route" :class="{ 'rounded-xl': config.customTitleBar && isLargeScreen }" @load="onIframeLoad" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes window-in {
  0%{
    transform: scale(0.5);
  }

  100%{
    transform: scale(1);
  }
}

@keyframes splash-icon {
  0%{
    transform: translateY(-50%);
  }
  100%{
    transform: translateY(0%);
  }
}

.window{
  animation: window-in 100ms ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.window-btn{
  @apply h-42px w-42px lh-42px text-center hover:bg-#000/10 last:rounded-tr-xl;
}

.splash-icon{
  animation: splash-icon 500ms ease-in infinite alternate;
}

iframe{
  width: 100%;
  height: 100%;
  border: none;
}
</style>
