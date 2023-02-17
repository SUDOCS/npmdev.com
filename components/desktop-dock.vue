<script setup lang="ts">
import { dockCenterApps, dockLeftApps, dockRightApps } from '@/applets'
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
        <div v-for="app in dockRightApps" :key="app.name" class="app-entry">
          <img :src="app.icon" :alt="app.title" w-full h-full object-fill>
          <span class="tooltip">{{ app.title }}</span>
        </div>
      </div>
      <!-- 备案号 -->
      <div
        absolute top--132px lh-24px w-160px left-0 right-0 mx-auto
        bg="[#c2e9fb66]" backdrop-blur-4px rounded-12px text-white text-12px select-none text-center
        cursor-pointer transition-colors shadow-2xl
        class="beian"
      >
        赣ICP备20000000号-1
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
  @apply absolute left-50% mx-auto top--40px py-4px px-12px rounded-12px;
  @apply bg-#eee text-black text-12px text-center whitespace-nowrap;
  transform: translateX(-50%);

  &::before{
    @apply absolute top-100% left-50% w-0 h-0 content-none;
    @apply border-6px border-#eee border-solid border-b-transparent border-l-transparent border-r-transparent;
    transform: translateX(-50%);
  }
}

.beian{
  &:hover{
    filter: contrast(2);
  }
}
</style>
