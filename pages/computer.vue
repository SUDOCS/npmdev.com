<script setup lang="ts">
import wallpapers from 'virtual:wallpaper-auto-scanner'
</script>

<template>
  <div w-full h-40vh flex-center relative>
    <img
      absolute z--1
      w-full h-full object-cover
      :src="wallpapers[Math.ceil(Math.random() * wallpapers.length) - 1]"
    >

    <h1 text-2xl text-white text-shadow-xl>
      Virtual Web Desktop
    </h1>
  </div>

  <div mt--3vh w-90vw mx-auto gap-xl flex flex-row flex-wrap justify-evenly pb-xl>
    <div
      v-for="x in 4" :key="x" inline-block bg-white rounded-xl p-xl shadow-xl flex-1
      min-w-75
    >
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
