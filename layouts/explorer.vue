<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const explorerStore = useExplorerStore()
const { listStyle } = storeToRefs(explorerStore)

const navHeader = ref()
const { height } = useElementSize(navHeader)

const dirs = computed(() => {
  return route.params.dirs as string[]
})
</script>

<template>
  <div ref="navHeader" fixed w-full border="~ divider b-solid">
    <!--  -->
    <div w-full frow px-xs gap-xs my-1>
      <div w-8 h-8 flex-center hover="bg-#ddd" rounded="1/2" @click="router.go(-1)">
        <Icon name="fluent:arrow-hook-up-left-24-regular" />
      </div>
      <div w-8 h-8 flex-center hover="bg-#ddd" rounded="1/2" @click="router.go(1)">
        <Icon name="fluent:arrow-hook-up-right-24-regular" />
      </div>

      <div flex-1 md:hidden />
      <div flex-1 h-8 frow items-center px-xs gap-xs hidden md:flex>
        <Icon name="fluent:divider-tall-24-regular" />
        <div v-for="(dir, idx) in dirs" :key="dir">
          <NuxtLink
            px-2 cursor-pointer bg="primary/50" hover="bg-primary/70" rounded-2 transition
            :to="`/explorer/${dirs.slice(0, idx + 1).join('/')}`"
          >
            {{ dir }}
          </NuxtLink>
          <Icon name="material-symbols:navigate-next" ml-xs />
        </div>
      </div>

      <div w-8 h-8 flex-center hover="bg-#ddd" rounded="1/2" @click="explorerStore.toggleStyle">
        <Icon v-show="listStyle === 'block'" name="fluent:apps-list-detail-24-regular" />
        <Icon v-show="listStyle === 'detail'" name="fluent:app-folder-24-regular" />
      </div>
      <div w-8 h-8 flex-center hover="bg-#ddd" rounded="1/2">
        <Icon name="fluent:info-24-regular" />
      </div>
    </div>

    <div w-full h-8 frow items-center px-1 gap-1 md:hidden>
      <Icon name="fluent:divider-tall-24-regular" />
      <div v-for="(dir, idx) in dirs" :key="dir">
        <NuxtLink
          px-2 cursor-pointer bg="primary/50" hover="bg-primary/70" rounded-2 transition
          :to="`/explorer/${dirs.slice(0, idx + 1).join('/')}`"
        >
          {{ dir }}
        </NuxtLink>
        <Icon name="material-symbols:navigate-next" ml-1 />
      </div>
    </div>
  </div>
  <!-- 占位置 -->
  <div w-full :style="{ height: `${height}px` }" />

  <div w-full>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
</style>
