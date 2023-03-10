<script setup lang="ts">
import downloadIllustration from '@/assets/illustrations/download.svg?inline'
import uploadIllustration from '@/assets/illustrations/upload.svg?inline'
</script>

<template>
  <div w-100vw h-100vh flex-center flex-wrap gap-20 p-10>
    <NuxtLink to="/file-transfer/sender" class="entrance">
      <img :src="uploadIllustration" alt="">
      <span>发送</span>
    </NuxtLink>
    <NuxtLink to="/file-transfer/receiver" class="entrance">
      <img :src="downloadIllustration" alt="">
      <span>接收</span>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.entrance{
  @apply relative w-16em h-16em flex-center flex-col gap-xl border border-solid border-black:10 rounded-xl transition;
  overflow: hidden;

  &:hover{
    cursor: pointer;

    &:before{
      opacity: 1;
      animation: rotate 4s linear infinite;
    }
  }

  &:before{
    @apply absolute w-full h-full rounded-xl z--2;
    background: linear-gradient(45deg, transparent, transparent 40%, black 50%, transparent 60%, transparent);
    content: '';
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  &:after{
    @apply absolute top-1px bottom-1px left-1px right-1px rounded-xl bg-white z--1;
    content: '';
    // opacity: 0;
    transition: opacity 0.5s ease;
  }
}
</style>
