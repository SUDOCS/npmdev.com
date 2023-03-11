<script setup lang="ts">
const roomId = ref('')

const senderId = ref(0)
const roomUser = ref<number[]>([])

const { status, data, close, send, ws, open: openWebsocket } = useWebSocket('ws://localhost:1323/ws', {
  immediate: false,
  autoClose: true,
  autoReconnect: true,
  heartbeat: false,
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
      send(buildWsData({
        action: WsAction.JoinRoom,
        room: parseInt(roomId.value),
        sender: senderId.value,
      }))
      break
    }
    case WsAction.SendRoomUserIds:{
      console.log('setup room', d.room)
      const { users } = parseRoomInfo(d.payload as ArrayBuffer)
      roomUser.value = users
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
  <transition v-if="status !== 'OPEN'" name="fade">
    <div absolute-full bg-white>
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
    发送
  </div>
</template>

<style lang="scss" scoped>
</style>
