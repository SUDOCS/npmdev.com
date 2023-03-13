<script setup lang="ts">
import type { Fn, WebSocketStatus } from '@vueuse/core'

const roomId = ref('')

let openWebsocket: Fn
let sendFileWithRTC: (file: File) => void
const wsStatus = ref<WebSocketStatus>('CLOSED')
const rtcStatus = ref<RTCPeerConnectionState>('closed')
const dataChannelStatus = ref<RTCDataChannelState>('closed')
const roomUserIds = ref<number[]>([])
const senderId = ref(0)

const fileList = ref<File[]>([])

onMounted(async () => {
  ({ openWebsocket, sendFileWithRTC } = await useWsRTC({
    roomId,
    role: 'sender',
    roomUserIds,
    senderId,
    wsStatus,
    rtcStatus,
    dataChannelStatus,
  }))
})

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files

  console.log(files)

  if (files) {
    fileList.value = Object.values(files)

    if (fileList.value.length > 0) {
      const file = fileList.value[0]
      sendFileWithRTC(file)
    }
  }
}
</script>

<template>
  <transition name="fade">
    <div v-if="wsStatus !== 'OPEN'" absolute-full bg-white z-1>
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

      <div relative w-full mt-xl py-2 border="2px dashed black/60" rounded-xl>
        <input type="file" absolute-full opacity-0 cursor-pointer @change="onFileChange">
        <Icon name="fluent:add-20-filled" w-6 h-6 text-black:60 />
      </div>

      <div py-xl>
        <div v-for="file in fileList" :key="file.name" text-left p-xs bg-black:10 rounded-xl>
          {{ file.name }}
        </div>
      </div>
      <!--
      <div w-30 h-10 lh-10 mx-auto mt-xl bg-blue:30 rounded-xl cursor-pointer shadow>
        发送
      </div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
