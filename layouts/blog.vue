<script setup lang="ts">
const showNavbar = ref(true)
const showNavbarShadow = ref(false)

const route = useRoute()

useHead({
  title: route.meta.title as unknown as string,
})
</script>

<template>
  <div class="bg-[rgba(245,245,245)] w-full min-h-100%">
    <BlogNavbar :show="showNavbar" :shadow="showNavbarShadow" />
    <BlogHeader />
  </div>
</template>

<style scoped lang="scss">

</style>
