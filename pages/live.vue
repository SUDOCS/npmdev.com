<script setup lang="ts">
const videoEle = ref<HTMLVideoElement>()

const {
  roomId,
  senderId,
  roomUserIds,
  wsStatus,
  pushing,
  pulling,
  chatMessages,
  openWebsocket,
  togglePublish,
  sendChatMessage,
} = useWsRTCLive({
  videoEle,
})

const showMember = ref(false)
const showChat = ref(false)
const showSidebar = computed(() => showMember.value || showChat.value)
const muted = ref(false)
const paused = ref(false)
const inputMsg = ref('')

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

function sendMsg() {
  if (inputMsg.value) {
    sendChatMessage(inputMsg.value)
    inputMsg.value = ''
  }
}
</script>

<template>
  <transition v-if="false" name="fade">
    <SerialNumberOverlay
      v-model="roomId" :show="wsStatus !== 'OPEN'" title="匹配序列号" subtitle="输入6位数字"
      :loading="wsStatus === 'CONNECTING'" auto-generate :open="openWebsocket"
    />
  </transition>

  <div fcol h="100vh" class="live">
    <div flex-1 w-full frow items-stretch overflow-hidden relative>
      <div class="live-main" overflow-y-auto overflow-x-hidden relative>
        <div v-show="!pushing && !pulling">
          <div py-xl>
            【{{ roomId }}】在线用户
          </div>
          <div text-text-second text-sm border="~ dashed divider" p-2 bg-bg-a rounded-2>
            <span>
              WebSocket 连接状态{{ wsStatus === 'OPEN' ? '🟢' : '🔴' }}
            </span>
          </div>
          <div frow flex-wrap gap-xl py-xl items-center justify-center>
            <div v-for="(userId, idx) in roomUserIds" :key="idx" fcol>
              <Avatar :name="userId.toString()" />
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
          <div v-for="userId in roomUserIds" :key="userId" frow gap-xs px-3 py-2 border="~ divider b-solid">
            <Avatar :name="userId.toString()" :length="3" size="small" />
            <div>
              {{ userId }}
            </div>
          </div>
        </div>
        <!-- 聊天 -->
        <div v-show="showChat" fcol h-full>
          <!-- 聊天记录 -->

          <div flex-1 w-full overflow-y-auto>
            <ChatMessage v-for="(msg, idx) in chatMessages" :key="idx" :from="msg.sender.toString()" type="chat" :msg="msg.msg" :left="msg.sender !== senderId" />
          </div>
          <!-- 输入区域 -->

          <div h-20 w-full relative border="~ divider t-solid">
            <textarea v-model="inputMsg" name="chatInput" rows="10" border-none w-full h-full outline-none p-xs />
            <div
              absolute right-4 bottom-4 px-4 py-1 border-none outline-none text-xs
              bg-primary hover:bg-primary-hover text-white rounded-sm cursor-pointer hover:bg-black:30 transition
              @click="sendMsg"
            >
              发送
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="live-bottom-bar">
      <div v-show="pulling && !muted" class="live-bottom-button">
        <Icon name="fluent:speaker-mute-24-regular" class="live-bottom-button-icon" />
        <span>开启静音</span>
      </div>
      <div v-show="pulling && muted" class="live-bottom-button">
        <Icon name="octicon:unmute-24" class="live-bottom-button-icon" />
        <span>解除静音</span>
      </div>
      <div v-show="pulling && paused" class="live-bottom-button">
        <Icon name="fluent:play-24-regular" class="live-bottom-button-icon" />
        <span>继续播放</span>
      </div>
      <div v-show="pulling && !paused" class="live-bottom-button">
        <Icon name="fluent:pause-24-regular" class="live-bottom-button-icon" />
        <span>暂停播放</span>
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
  @apply h-full md:w-90 2xl:w-120
  bg-white border border-#eee border-l-solid
  absolute-full md:relative;
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
