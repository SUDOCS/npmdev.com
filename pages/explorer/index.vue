<script setup lang="ts">
import desktopFolderSvg from '@/assets/icons/places/folder-desktop.svg?inline'
import documentFolderSvg from '@/assets/icons/places/folder-documents.svg?inline'
import musicFolderSvg from '@/assets/icons/places/folder-music.svg?inline'
import picturesFolderSvg from '@/assets/icons/places/folder-pictures.svg?inline'
import videoFolderSvg from '@/assets/icons/places/folder-videos.svg?inline'
</script>

<template>
  <ExplorerNavigation />

  <div class="explorer-entry-list">
    <NuxtLink class="explorer-entry" to="/explorer/desktop">
      <img :src="desktopFolderSvg" alt="">
      <div class="explorer-entry-space-detail">
        <div>桌面</div>
      </div>
    </NuxtLink>

    <NuxtLink class="explorer-entry" to="/explorer/musics">
      <img :src="musicFolderSvg" alt="">
      <div class="explorer-entry-space-detail">
        <div>音乐</div>
      </div>
    </NuxtLink>

    <NuxtLink class="explorer-entry" to="/explorer/pictures">
      <img :src="picturesFolderSvg" alt="">
      <div class="explorer-entry-space-detail">
        <div>图片</div>
      </div>
    </NuxtLink>

    <NuxtLink class="explorer-entry" to="/explorer/videos">
      <img :src="videoFolderSvg" alt="">
      <div class="explorer-entry-space-detail">
        <div>视频</div>
      </div>
    </NuxtLink>

    <NuxtLink class="explorer-entry" to="/explorer/documents">
      <img :src="documentFolderSvg" alt="">
      <div class="explorer-entry-space-detail">
        <div>文档</div>
      </div>
    </NuxtLink>
  </div>
</template>

<style lang="scss">
.explorer-entry-list{
    @apply gap-4 p-xl grid
    grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8
    2xl:grid-cols-10;
}
.explorer-entry{
    @apply rounded-xl p-xl
    fcol text-sm cursor-pointer border border-solid border-divider
    hover:bg-black/5 transition-colors duration-300;

    img{
        @apply w-32 h-32;
    }

    &-space-detail{
        @apply flex-1 flex-center;
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
}
</style>
