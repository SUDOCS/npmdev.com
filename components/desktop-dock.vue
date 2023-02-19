<script setup lang="ts">
import { dockCenterApps, dockLeftApps, dockRightApps } from '@/applets'

let timer: NodeJS.Timer | null = null

const date = ref(new Date())

onMounted(() => {
  timer = setInterval(() => {
    date.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer as NodeJS.Timer)
})
</script>

<template>
  <div h-80px p-xs fixed bottom-0 left-0 right-0 relative class="animate-[dockin_500ms_ease-out_forwards]">
    <div
      w-full h-full rounded-12px text-center relative
      un-before="content-none absolute top-0 bottom-0 left-0 right-0 backdrop-blur-4px bg-[#c2e9fb66] m--4px rounded-12px"
    >
      <!-- 左边 -->
      <div min-w="72px" max-w="1/4" h-full rounded-12px absolute left-6px top-0 flex="~ row gap-16px" justify-start items-center>
        <div v-for="app in dockLeftApps" :key="app.name" class="app-entry">
          <img :src="app.icon" :alt="app.title" w-full h-full object-fill>
          <span class="tooltip">{{ app.title }}</span>
        </div>
      </div>
      <!-- 中间 -->
      <div max-w="3/4" lg:max-w="1/2" mx-auto h-full rounded-12px flex="~ row gap-16px" justify-center items-center>
        <div v-for="app in dockCenterApps" :key="app.name" class="app-entry">
          <img :src="app.icon" :alt="app.title" w-full h-full object-fill>
          <span class="tooltip">{{ app.title }}</span>
        </div>
      </div>
      <!-- 右边 -->
      <div min-w="72px" max-w="1/4" h-full rounded-12px absolute right-6px top-0 flex="~ row gap-16px" justify-end items-center>
        <!-- 时间和备案号 -->
        <div flex="~ col" justify-evenly items-center h-48px>
          <span text-15px>
            {{ date.toLocaleDateString() }} {{ date.toLocaleTimeString() }}
          </span>

          <a text-13px href="https://beian.miit.gov.cn" target="_blank">
            赣ICP备20000000号-1
          </a>
        </div>

        <div v-for="app in dockRightApps" :key="app.name" class="app-entry">
          <img :src="app.icon" :alt="app.title" w-full h-full object-fill>
          <span class="tooltip">{{ app.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes dockin {
  0% {
    bottom: -80px;
  }

  100%{
    bottom: 0px;
  }
}

.app-entry{
  @apply h-48px w-48px relative;
  transition: filter 0.2s ease-in-out;

  &:hover{
    filter: contrast(2);

    .tooltip{
      opacity: 1;
    }
  }
}

.tooltip{
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  @apply absolute left-50% mx-auto top--40px py-4px px-12px rounded-12px bg-#eee text-black text-12px text-center whitespace-nowrap;
  transform: translateX(-50%);

  &:before{
    @apply absolute top-100% left-50% w-0 h-0 content-none border-6px border-#eee border-solid border-b-transparent border-l-transparent border-r-transparent;
    transform: translateX(-50%);
  }
}
</style>
