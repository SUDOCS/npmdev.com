<script setup lang="ts">
const fileList = ref<File[]>([])
const percentages = ref<Record<string, number>>({})

const {
  roomId,
  senderId,
  roomUserIds,
  wsStatus,
  rtcStatus,
  dataChannelStatus,
  startWebRTC,
  sendFileWithRTC,
  openWebsocket,
} = useWsRTCFileTransfer({ role: 'sender', autoGenerateRoomId: true })

watch(roomUserIds, (ids) => {
  if (ids.length === 2) {
    startWebRTC()
  }
})

function onFileChange(e: Event) {
  const fl = (e.target as HTMLInputElement).files
  if (fl && Object.values(fl).length > 0) {
    const file = Object.values(fl)[0]
    sendFileWithRTC(file, onPercentage)

    if (!fileList.value.some(f => f.name === file.name)) {
      // 新文件
      percentages.value = { ...percentages.value, [file.name]: 0 }
      fileList.value = [...fileList.value, file]
    }
  }
}

function onPercentage(name: string, percentage: number) {
  console.log(name, percentage)
  percentages.value = { ...percentages.value, [name]: percentage }
}
</script>

<template>
  <transition name="fade">
    <SerialNumberOverlay
      v-model="roomId" :show="wsStatus !== 'OPEN'" title="芝麻开门" subtitle="*输入序列，用于匹配发送者与接收者"
      :loading="wsStatus === 'CONNECTING'" auto-generate :open="openWebsocket"
    />
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

      <div py-xl fcol gap-xs items-stretch>
        <div v-for="file in fileList" :key="file.name" text-left p-xs bg-black:10 rounded-xl frow justify-between relative overflow-hidden>
          <!-- percentage -->
          <div :style="{ width: `${percentages[file.name]}%` }" absolute left-0 top-0 bottom-0 bg-blue:40 transition="width" pointer-events-none />
          <span>
            {{ file.name }}
          </span>
          <span>
            {{ percentages[file.name].toFixed(2) }}%
          </span>
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
