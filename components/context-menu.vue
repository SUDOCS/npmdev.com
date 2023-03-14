<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  position: {
    clientX: number
    clientY: number
  }
  menus: any
}>(), {
  menus: [],
})

const emits = defineEmits([
  'update:show',
])

const contextMenuStyle = ref({})

const { show, position, menus } = toRefs(props)

const padding = 4
const menuWidth = 240 + padding * 2
const menuHeight = padding + (36 + padding) * menus.value.length

watch(position, (pos) => {
  const whVar = {
    '--height': `${menuHeight}px`,
    '--width': `${menuWidth}px`,
  }
  const { clientX, clientY } = pos
  let top, left, right, bottom
  if (clientX + menuWidth > document.body.clientWidth) {
    right = `${document.body.clientWidth - clientX - padding}px`
  }
  else {
    left = `${clientX + padding}px`
  }

  if (clientY + menuHeight > document.body.clientHeight) {
    bottom = `${document.body.clientHeight - clientY - padding}px`
  }
  else {
    top = `${clientY + padding}px`
  }
  contextMenuStyle.value = { ...whVar, top, left, right, bottom }
})

function onItemClick(menuIdx: number) {
  const func = menus.value[menuIdx].func
  func && func()
  emits('update:show', false)
}
</script>

<template>
  <ul v-show="show" class="desktop-right-menu" :style="contextMenuStyle" @click.stop="emits('update:show', false)">
    <li v-for="(config, index) in menus" :key="index" class="menu-item" @click="onItemClick(index)">
      <span>{{ config.text }}</span>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
$padding: 4px;
$item-width: 240px;
$item-height: 36px;
$border-radius: 8px;

@keyframes menu-in {
    0% {
        opacity: 0;
        height: 0;
        width: 0;
    }

    100% {
        opacity: 1;
        height: var(--height);
        width: var(--width);
    }
}

.desktop-right-menu {
    @apply absolute top-auto bottom-auto left-auto right-auto
    z-999999 opacity-100 font-bold overflow-hidden bg-#eff2f5;
    border-radius: $border-radius;
    padding: 0 $padding;
    animation: menu-in .1s ease-out;
    width: $item-width + $padding * 2;
    box-shadow: 0 0 6px 6px rgb(black, 0.02);

    .menu-item {
        @apply font-16px pl-12px select-none;
        height: $item-height;
        min-width: $item-width;
        line-height: $item-height;
        margin: $padding 0;
        transition: background-color .2s ease-out;
        border-radius: $border-radius;

        .iconfont {
            margin-right: $padding * 2;
        }

        &:hover {
            background-color: rgba(black, .05);
        }
    }
}
</style>
