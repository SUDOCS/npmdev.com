<script setup lang="ts">

</script>

<template>
  <div
    w="full" h="[calc(100vh-80px)]" p-12px
    grid="~ cols-[repeat(auto-fill,72px)] rows-[repeat(auto-fill,108px)] flow-col" gap-x-12px
  >
    <div
      v-for="x in 15" :key="x"
      select-none flex="~ col" justify-center items-center rounded-6px p-12px font-bold
    >
      <img h-48px w-48px object-contain src="" alt="">
      <label text-black text-13px text-center w-72px overflow-hidden whitespace-nowrap text-ellipsis break-words>
        计算机
      </label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
