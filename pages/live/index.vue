<script setup lang="ts">
const videoEle = ref<HTMLVideoElement>()

const { roomId, senderId, roomUserIds, wsStatus, pushing, pulling, openWebsocket, togglePublish } = useWsRTCLive({
  videoEle,
})

const showMember = ref(false)
const showChat = ref(false)
const showSidebar = computed(() => showMember.value || showChat.value)

function generateRoomId() {
  roomId.value = Math.random().toString(10).slice(2, 8)
}

function toggleSidebar(val: 'member' | 'chat') {
  if (val === 'member') {
    showMember.value = !showMember.value
    showChat.value = false
  }
  else {
    showChat.value = !showChat.value
    showMember.value = false
  }
}
</script>

<template>
  <div v-show="wsStatus !== 'OPEN'" absolute inset-0 fcol justify-center gap-10 p-10 z-1 bg-white>
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
        <div v-show="!pushing && !pulling">
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

        <div v-show="pushing || pulling" absolute-full flex-center>
          <video ref="videoEle" w-full h-full autoplay controls />
        </div>
      </div>

      <!-- 侧边栏 -->

      <div v-show="showSidebar" class="live-side" relative>
        <!-- 成员 -->
        <div v-show="showMember" h-full overflow-y-auto>
          <div v-for="x in 20" :key="x" frow gap-xs px-3 py-2 border="~ #eee b-solid" last="border-none">
            <div rounded="1/2" w-12 h-12 lh-12 text-center bg-orange:10 border="~ #ddd solid">
              <span>{{ (x + 100).toString().slice(0, 3) }}</span>
            </div>
            <div>
              14321432
            </div>
          </div>
        </div>
        <!-- 聊天 -->
        <div v-show="showChat" fcol h-full>
          <!-- 聊天记录 -->

          <div flex-1 w-full>
            12
          </div>
          <!-- 输入区域 -->

          <div h-20 w-full relative border="~ #ddd t-solid">
            <textarea name="chatInput" rows="10" border-none w-full h-full outline-none p-xs />

            <div
              absolute right-4 bottom-4 px-4 py-1 border-none outline-none text-xs
              bg-black:20 rounded-sm cursor-pointer hover:bg-black:30 transition
            >
              发送
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="live-bottom-bar">
      <div class="live-bottom-button">
        <Icon name="fluent:speaker-mute-24-regular" class="live-bottom-button-icon" />
        <span>静音</span>
      </div>
      <div class="live-bottom-button" @click="togglePublish">
        <Icon name="fluent:dual-screen-desktop-24-regular" class="live-bottom-button-icon" />
        <span>分享屏幕</span>
      </div>
      <div class="live-bottom-button" @click="toggleSidebar('member')">
        <Icon name="fluent:people-24-regular" class="live-bottom-button-icon" />
        <span>成员</span>
      </div>
      <div class="live-bottom-button" @click="toggleSidebar('chat')">
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
  frow justify-center gap-xl select-none;

  .live-bottom-button{
    @apply fcol text-xs;

    .live-bottom-button-icon{
      @apply w-10 h-10 p-2 rounded-xl hover:bg-black:10 cursor-pointer;
    }
  }
}
</style>
