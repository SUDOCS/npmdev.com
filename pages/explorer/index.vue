<script setup lang="ts">
import desktopFolderSvg from '@/assets/icons/places/folder-desktop.svg?inline'
import documentFolderSvg from '@/assets/icons/places/folder-documents.svg?inline'
import musicFolderSvg from '@/assets/icons/places/folder-music.svg?inline'
import picturesFolderSvg from '@/assets/icons/places/folder-pictures.svg?inline'
import videoFolderSvg from '@/assets/icons/places/folder-videos.svg?inline'

definePageMeta({
  title: '文件资源管理器',
})
</script>

<template>
  <div class="explorer-entry-list-block">
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
.explorer-entry-list-block{
    @apply gap-4 p-xl grid
    grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9
    2xl:grid-cols-12;

    .explorer-entry{
      @apply fcol border border-divider border-solid rounded-xl;

      img{
          @apply w-24 h-24 md:w-32 md:h-32;
      }

      .explorer-entry-space-detail{
        @apply flex-1 flex-center pb-2 px-2 break-all;
      }
    }
}

.explorer-entry{
    @apply text-sm cursor-pointer border-none
    hover:bg-black/5;
    transition: background-color .2s ease-in-out;
}

.explorer-entry-list-detail{
  @apply fcol w-full gap-1 p-xl;

  .explorer-entry{
    @apply w-full frow px-1 rounded-1;

    img{
        @apply w-10 h-10;
    }

    .explorer-entry-space-detail{
        @apply flex-1 text-left pl-2;
    }
  }
}
</style>
