<script setup lang="ts">
const route = useRoute()
const router = useRouter()
</script>

<template>
  <div fixed w-full h-12 border="~ divider b-solid" frow px-xs gap-xs>
    <div w-8 h-8 flex-center hover="bg-#ddd" rounded="1/2" @click="router.go(-1)">
      <Icon name="fluent:arrow-hook-up-left-24-regular" />
    </div>
    <div w-8 h-8 flex-center hover="bg-#ddd" rounded="1/2" @click="router.go(1)">
      <Icon name="fluent:arrow-hook-up-right-24-regular" />
    </div>

    <div flex-1 h-8 bg="#ddd" rounded-4 px-3 lh-8 frow>
      <span px-1>/</span>
      <div v-for="dir in route.params.slug" :key="dir">
        <span px-1 cursor-pointer hover-bg-white rounded-2 transition>
          {{ dir }}
        </span>
        <span px-1>/</span>
      </div>
    </div>
    <div w-8 h-8 flex-center hover="bg-#ddd" rounded="1/2">
      <Icon name="fluent:info-24-regular" />
    </div>
  </div>
  <!-- 占位置 -->
  <div w-full h-12 />
</template>

<style lang="scss" scoped>
</style>
