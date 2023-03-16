<script setup>
import wallpapers from 'virtual:wallpaper-auto-scanner'

const title = ref('📚 标题')

const wallpaper = ref(wallpapers[Math.floor(Math.random() * wallpapers.length)])
</script>

<template>
  <header
    class="blog-header" :style="{ backgroundImage: `url(${wallpaper})` }"
    @contextmenu.prevent @mouseup.right="onRightMouseUp" @mouseup.left="showRightClickWidget = false"
  >
    <div class="title-box">
      <h1>{{ title }}</h1>
    </div>
  </header>
</template>

<style scoped lang="scss">
@keyframes fadeInUp {
  0% {
    transform: translateY(50%);
    opacity: 0;
  }
  100% {
    transform: none;
    opacity: 1;
  }
}
.blog-header {
  @apply h-20rem md:h-25rem w-full bg-center bg-no-repeat flex-center text-white
  transition-all duration-300ms transition-ease-out bg-cover;

  .title-box {
    text-shadow: 0 0 4px #1c1f21;
    animation: fadeInUp ease-out .5s;
  }
}
</style>
