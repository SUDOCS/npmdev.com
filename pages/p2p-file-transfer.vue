<script setup lang="ts">
enum Role {
  Sender = 'sender',
  Receiver = 'receiver',
}

const role = ref(Role.Sender)
const fileInput = ref<HTMLInputElement>()
const files = ref<FileList | null>()
const logExpanded = ref(false)

function changeRole(newRole: Role) {
  role.value = newRole
}

function chooseFile() {
  fileInput.value?.click()
}

function onFileChange() {
  console.log(fileInput.value?.files)
  files.value = fileInput.value?.files ?? null
}
</script>

<template>
  <div text-center mt-lg>
    <div
      w-18.75em h-2.5em mx-auto flex-center gap-0.25em bg-black:5
      border border-solid border-black:20 rounded-xl
    >
      <div
        class="role-button" :class="{ 'role-button-active': role === Role.Sender }"
        @click="changeRole(Role.Sender)"
      >
        发送方
      </div>
      <div
        class="role-button" :class="{ 'role-button-active': role === Role.Receiver }"
        @click="changeRole(Role.Receiver)"
      >
        接收方
      </div>
    </div>
  </div>

  <div w-80vw mx-auto mt-lg border="2px black/60 dashed" rounded-lg bg-black:5 p-xl flex-center>
    <input ref="fileInput" type="file" hidden @change="onFileChange">

    <div border-none w-10 h-10 rounded-xl border="dashed 2px black/30" flex-center cursor-pointer @click="chooseFile">
      <Icon name="fluent:add-12-filled" />
    </div>
  </div>

  <div w-80vw mx-auto mt-lg>
    <div v-for="file in files" :key="file.lastModified" rounded-lg w-full bg-black:5 px-xl py-xs>
      {{ file.name }}
    </div>
  </div>

  <div
    fixed bottom-0 left-0 right-0
    mx-auto mt-lg bg-black:10
    bg-black:5 text-sm
    z-0 shadow-xl
  >
    <div w-full relative py-1>
      <div
        absolute left="50%" top="0" translate-x="-50%" translate-y="-50%" z-10 rounded="50%"
        text-30px bg-black text-white cursor-pointer
        @click="logExpanded = !logExpanded"
      >
        <Icon
          name="material-symbols:play-arrow-outline-rounded" transition="transform" duration="300ms"
          :class="{ 'rotate--90': !logExpanded, 'rotate-90': logExpanded }"
        />
      </div>
      <div
        overflow-y-scroll px-3 transition="height" ease-out duration="400ms"
        :class="{ 'h-10vh': !logExpanded, 'h-30vh': logExpanded }"
      >
        <p v-for="x in 20" :key="x">
          [时间] [WebSocket] 消息一
        </p>
        <p v-for="x in 20" :key="x">
          [时间] [WebRTC] 消息一
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
button{
  outline: none;
}

.role-button{
  @apply w-9em h-2em lh-2em rounded-xl transition;

  &:hover{
    @apply bg-black:10;
    cursor: pointer;
  }

  &-active{
    background-color: rgba(black, 0.15) !important;
  }
}
</style>
