<script setup lang="ts">
import type { Fn, WebSocketStatus } from '@vueuse/core'

let openWebsocket: Fn
const roomId = ref('')
const wsStatus = ref<WebSocketStatus>('CLOSED')
const rtcStatus = ref<RTCPeerConnectionState>('closed')
const dataChannelStatus = ref<RTCDataChannelState>('closed')
const roomUserIds = ref<number[]>([])
const senderId = ref(0)

onMounted(async () => {
  ({ openWebsocket } = await useWsRTC({
    roomId,
    role: 'receiver',
    roomUserIds,
    senderId,
    wsStatus,
    rtcStatus,
    dataChannelStatus,
  }))
})
</script>

<template>
  <transition v-if="wsStatus !== 'OPEN'" name="fade">
    <div absolute-full bg-white z-1>
      <div pt-30vh max-w-80vw mx-auto text-center>
        <h1>
          芝麻开门
        </h1>

        <span>*输入序列，用于匹配发送者与接收者</span>

        <serial-number v-model="roomId" :length="6" py-lg />

        <div
          w-4em h-4em lh-4em rounded="50%" text-center mx-auto text-white cursor-pointer
          my-xl shadow transition flex-center
          :class="{
            'bg-black': roomId.length === 6,
            'bg-black/50': roomId.length !== 6,
          }"
        >
          <loading-spinner v-if="wsStatus === 'CONNECTING'" />
          <span v-else @click="openWebsocket">开启</span>
        </div>
      </div>
    </div>
  </transition>

  <hr>

  <div>
    <div w-80vw mx-auto text-center>
      <div pt-xl>
        {{ roomId }}，在线用户
      </div>
      <div frow flex-wrap justify-center gap-xl py-xl>
        <div v-for="(userId, idx) in roomUserIds" :key="idx" fcol>
          <div
            w-16 h-16 lh-16 text-center bg-black:10 rounded="1/2" border="~ solid black"
          >
            {{ userId.toString().slice(0, 4) }}
          </div>
          <span>
            {{ userId === senderId ? '我' : '对方' }}
          </span>
        </div>
      </div>

      <hr>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
