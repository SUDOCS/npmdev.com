<script setup lang="ts">

</script>

<template>
  <div h-80px p-xs fixed bottom-0 left-0 right-0 relative class="animate-[dockin_300ms_ease-out_forwards]">
    <div
      w-full h-full rounded-12px text-center relative
      un-before="content-none absolute top-0 bottom-0 left-0 right-0 backdrop-blur-4px bg-[#c2e9fb]/30 m--4px rounded-12px"
    >
      <!-- 左边 -->
      <div min-w="72px" max-w="1/4" h-full rounded-12px absolute left-0 top-0 />
      <!-- 中间 -->
      <div max-w="1/2" mx-auto h-full rounded-12px />
      <!-- 右边托盘 -->
      <div min-w="72px" max-w="1/4" h-full rounded-12px absolute right-0 top-0 />
    </div>
  </div>
</template>

<style lang="scss">
@keyframes dockin {
  0% {
    bottom: calc(-100% - 4px);
  }

  100%{
    bottom: 0px;
  }
}
</style>
