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
