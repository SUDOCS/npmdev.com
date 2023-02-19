<script setup lang="ts">
</script>

<template>
  <div w-100vw h-100vh overflow-hidden>
    <DesktopGrid />
    <DesktopDock />
    <DesktopWindow />

    <div fixed top-0 bottom-0 right-0 left-0 z--1>
      <img
        w-full h-full object-cover class="animate-[bganim_60s_linear_infinite] lg:animate-none"
        src="https://images.unsplash.com/photo-1509565840034-3c385bbe6451?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&q=50" alt=""
      >
    </div>
  </div>
</template>

<style lang="scss">
@keyframes bganim {
  0% {
    object-position: left top;
  }

  100%{
    object-position: right bottom;
  }
}
</style>
