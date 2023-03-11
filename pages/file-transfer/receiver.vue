<script setup lang="ts">
const roomId = ref('')

const connecting = ref(false)
const roomConnected = ref(false)
</script>

<template>
  <transition v-if="!roomConnected" name="fade">
    <div absolute-full>
      <div pt-30vh max-w-80vw mx-auto text-center>
        <h1>
          芝麻开门
        </h1>

        <span>*输入序列，用于匹配发送者与接收者</span>

        <serial-number v-model:value="roomId" :length="6" py-lg />

        <div
          w-4em h-4em lh-4em rounded="50%" text-center mx-auto text-white cursor-pointer
          my-xl shadow transition
          :class="{
            'bg-black': roomId.length === 6,
            'bg-black/50': roomId.length !== 6,
          }"
        >
          <loading-spinner v-if="connecting" />
          <span v-else>开启</span>
        </div>
      </div>
    </div>
  </transition>

  <div>
    发送
  </div>
</template>

<style lang="scss" scoped>
</style>
