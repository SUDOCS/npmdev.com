<script setup lang="ts">
const video = ref()

const { roomId, senderId, roomUserIds, wsStatus, sendWs, openWebsocket } = useWs()

let rtcConn: RTCPeerConnection

function startRTC() {
  rtcConn = new RTCPeerConnection()
}

const { stream, start: startScreenSharing, stop: stopScreenSharing, enabled: onSharing } = useDisplayMedia()

watch(stream, (s) => {
  console.log('stream', s, video.value)

  // preview on a video element
  if (video.value && s)
    video.value.srcObject = s
})

onMounted(async () => {
  roomUserIds.value = Array.from({ length: 90 }, () => Math.floor(Math.random() * 1000000))
})

function generateRoomId() {
  roomId.value = Math.random().toString(10).slice(2, 8)
}
</script>

<template>
  <!-- <div v-show="wsStatus !== 'OPEN'" h-100vh fcol justify-center gap-10 p-10> -->
  <div v-show="false" absolute inset-0 fcol justify-center gap-10 p-10 z-1 bg-white>
    <div text-center>
      <div text-xl>
        匹配序列号
      </div>
      <SerialNumber v-model="roomId" py-xl />

      <div underline cursor-pointer @click="generateRoomId">
        随机生成
      </div>
    </div>

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

  <div fcol h="100vh">
    <div flex-1 w-full frow items-stretch overflow-hidden>
      <div class="live-main" overflow-y-auto overflow-x-hidden relative>
        <div v-show="!onSharing">
          <div pt-xl>
            {{ roomId }}，在线用户
          </div>
          <div frow flex-wrap gap-xl py-xl items-center justify-center>
            <div v-for="(userId, idx) in roomUserIds" :key="idx" fcol>
              <div
                w-16 h-16 lh-16 text-center bg-orange:10 rounded="1/2" border="~ #ddd solid"
              >
                {{ userId.toString().slice(0, 4) }}
              </div>
              <span>
                {{ userId === senderId ? '我' : userId }}
              </span>
            </div>
          </div>
        </div>

        <div v-show="onSharing" absolute-full flex-center>
          <video ref="video" w-full h-full autoplay />
        </div>
      </div>

      <!-- 侧边栏 -->

      <div class="live-side">
        <div>
          成员
        </div>

        <div>
          聊天
        </div>
      </div>
    </div>

    <div class="live-bottom-bar">
      <div class="live-bottom-button">
        <Icon name="fluent:speaker-mute-24-regular" class="live-bottom-button-icon" />
        <span>静音</span>
      </div>
      <div class="live-bottom-button" @click="startScreenSharing">
        <Icon name="fluent:dual-screen-desktop-24-regular" class="live-bottom-button-icon" />
        <span>分享屏幕</span>
      </div>
      <div class="live-bottom-button">
        <Icon name="fluent:people-24-regular" class="live-bottom-button-icon" />
        <span>成员</span>
      </div>
      <div class="live-bottom-button">
        <Icon name="fluent:chat-24-regular" class="live-bottom-button-icon" />
        <span>沟通</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.live-main{
  @apply flex-1 text-center  bg-white;
}

.live-side{
  @apply w-40 h-full md:w-60 lg:w-70 xl:w-80 2xl:w-100 bg-white border border-#eee border-l-solid
  relative;
}

.live-bottom-bar{
  @apply w-full h-16 bottom-0 left-0 right-0 py-1 bg-white shadow
  border border-#eee border-t-solid
  frow justify-center gap-xl;

  .live-bottom-button{
    @apply fcol text-xs;

    .live-bottom-button-icon{
      @apply w-10 h-10 p-2 rounded-xl hover:bg-black:10 cursor-pointer;
    }
  }
}
</style>
