<script setup lang="ts">
import type { Fn, WebSocketStatus } from '@vueuse/core'

const roomId = ref('')

const senderId = ref(0)
const roomUserIds = ref<number[]>([
  12121212, 22121212,
])

let status = ref<WebSocketStatus>('CLOSED')
let data = ref<any>()
let sendWs: (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean
let openWebsocket: Fn

onMounted(() => {
  roomId.value = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');

  ({ status, data, send: sendWs, open: openWebsocket } = useWebSocket('ws://localhost:1323/ws', {
    immediate: false,
    autoClose: true,
    autoReconnect: true,
    heartbeat: false,
  }))
})

const stopWatchWsStatus = watch(status, (oldStatus, newStatus) => {
  console.log(oldStatus, newStatus)
})

const stopWatchData = watch(data, (val) => {
  if (val instanceof ArrayBuffer || val instanceof Blob) {
    console.log('receive binary data', val)
    processWsData(val)
  }
  else {
    console.log('receive text data', val)
  }
})

async function processWsData(data: ArrayBuffer | Blob) {
  const d = await parseWsData(data)
  switch (d.action) {
    case WsAction.SendClientInfo: {
      console.log('setup client')
      senderId.value = d.sender

      // 加入房间
      sendWs(buildWsData({
        action: WsAction.JoinRoom,
        room: parseInt(roomId.value),
        sender: senderId.value,
      }))
      break
    }
    case WsAction.SendRoomUserIds:{
      console.log('setup room', d.room, d.payload)
      const { users } = parseRoomInfo(d.payload as ArrayBuffer)
      roomUserIds.value = users
      break
    }
  }
}

onUnmounted(() => {
  stopWatchData()
  stopWatchWsStatus()
})
</script>

<template>
  <transition name="fade">
    <div v-if="status !== 'OPEN'" absolute-full bg-white hidden>
      <div pt-30vh max-w-80vw mx-auto text-center>
        <h1>
          芝麻开门
        </h1>

        <span>*输入序列，用于匹配发送者与接收者</span>

        <serial-number v-model:value="roomId" :length="6" py-lg />

        <div
          w-4em h-4em lh-4em rounded="50%" text-center mx-auto text-white cursor-pointer
          my-xl shadow transition flex-center
          :class="{
            'bg-black': roomId.length === 6,
            'bg-black/50': roomId.length !== 6,
          }"
        >
          <loading-spinner v-if="status === 'CONNECTING'" />
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
        <input type="file" absolute-full opacity-0 cursor-pointer>
        <Icon name="fluent:add-20-filled" w-6 h-6 text-black:60 />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
