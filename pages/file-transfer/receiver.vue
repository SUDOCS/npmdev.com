<script setup lang="ts">
import type { SliceFile } from '~~/utils/file'

const fileList = ref<SliceFile[]>([])

const {
  roomId,
  roomUserIds,
  senderId,
  wsStatus,
  rtcStatus,
  dataChannelStatus,
  openWebsocket,
} = useWsRTCFileTransfer({ role: 'receiver', onFileReceived })

function onFileReceived(file: SliceFile) {
  console.log('on file received', file)

  if (fileList.value.some(f => f.name === file.name)) {
    fileList.value = fileList.value.map(f => f.name === file.name ? file : f)
  }
  else {
    fileList.value = [...fileList.value, file]
  }
}

function downloadFile(file: SliceFile) {
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(file.Blob)
  link.download = file.name

  link.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  }))

  setTimeout(() => {
    window.URL.revokeObjectURL(link.href)
    link.remove()
  })
}
</script>

<template>
  <transition name="fade">
    <SerialNumberOverlay
      v-model="roomId" :show="wsStatus !== 'OPEN'" title="芝麻开门" subtitle="*输入6位数字，用于匹配发送者与接收者"
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
          <Avatar :name="userId.toString()" />
          <span>
            {{ userId === senderId ? '我' : '对方' }}
          </span>
        </div>
      </div>

      <div py-xl fcol gap-xs items-stretch>
        <div v-for="file in fileList" :key="file.name" text-left p-xs bg-black:10 rounded-xl frow justify-between relative overflow-hidden>
          <!-- percentage -->
          <div :style="{ width: `${file.percentage}%` }" absolute left-0 top-0 bottom-0 bg-blue:40 transition="width" pointer-events-none />
          <span>
            {{ file.name }}
          </span>

          <span v-if="!file.complete">
            {{ file.percentage.toFixed(2) }}%
          </span>
          <button v-else p-1 outline-none border-none bg-transparent cursor-pointer hover:bg-black:10 rounded="1/2">
            <Icon
              name="fluent:arrow-download-24-regular" text-5 lh-5 scoped @click="downloadFile(file)"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
