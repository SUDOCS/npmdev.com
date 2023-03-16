<script setup lang="ts">
import driverSvg from '@/assets/icons/apps/drive-network.svg?inline'
</script>

<template>
  <div class="explorer-entry-list">
    <div class="explorer-entry">
      <img :src="driverSvg" alt="">
      <div class="explorer-entry-space-detail">
        <div>阿里云</div>
        <progress class="explorer-entry-space-bar" value="10" max="100" />
        <div>
          <span>已用 1.2GB</span>
          <span> / </span>
          <span>总容量 2.0GB</span>
        </div>
      </div>
    </div>
    <div class="explorer-entry">
      <img :src="driverSvg" alt="">
      <div class="explorer-entry-space-detail">
        <div>腾讯云</div>
        <progress class="explorer-entry-space-bar" value="10" max="100" />
        <div>
          <span>已用 1.2GB</span>
          <span> / </span>
          <span>总容量 2.0GB</span>
        </div>
      </div>
    </div>
    <div v-for="x in 5" :key="x" class="explorer-entry">
      <img :src="driverSvg" alt="">
      <div class="explorer-entry-space-detail">
        <div>AWS S3</div>
        <progress class="explorer-entry-space-bar" :value="Math.random() * 100" max="100" />
        <div>
          <span>已用 1.2GB</span>
          <span> / </span>
          <span>总容量 2.0GB</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.explorer-entry-list{
    @apply gap-4 p-xl grid
    grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
    2xl:grid-cols-5;
}
.explorer-entry{
    @apply h-20 rounded-xl
    frow text-sm cursor-pointer border border-solid border-divider
    hover:bg-black/5 transition-colors duration-300;

    &-space-detail{
        @apply flex-1 fcol justify-center items-start pr-xl;
    }

    &-space-bar{
        @apply w-full h-2 my-1 bg-divider;

        &::-webkit-progress-bar{
            @apply bg-divider;
        }

        &::-webkit-progress-value{
            @apply bg-primary;
        }
    }

    img{
        @apply w-16 h-16 mx-4;
    }
}
</style>
