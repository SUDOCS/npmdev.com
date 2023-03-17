<script setup lang="ts">
import WaveSurfer from 'wavesurfer.js'
const audioEle = ref<HTMLAudioElement>()
const waveEle = ref<HTMLDivElement>()
const groupActive = ref<'main' | 'upload' | 'detail'>('main')
const files = shallowRef<File[]>([])

const currentFile = shallowRef<File>()

function onFileChange(fl: FileList) {
  const fileNames = files.value.map(f => f.name)
  for (let i = 0; i < fl.length; i++) {
    const file = Object.values(fl)[i]

    if (!fileNames.includes(file.name)) {
    // 新文件
      files.value = [...files.value, file]
    }
  }

  if (currentFile.value === undefined) {
    currentFile.value = files.value[0]
  }
}

onMounted(() => {
  if (files.value.length === 0) {
    groupActive.value = 'upload'
  }
})

function play() {
  if (currentFile.value) {
    const wave = WaveSurfer.create({
      container: waveEle.value,
      waveColor: 'gray',
      progressColor: 'black',
      barWidth: 2,
      barRadius: 2,
      barGap: 1,
    })

    wave.on('ready', () => {
      wave.play()
    })
    wave.load(URL.createObjectURL(currentFile.value))
  }
}
</script>

<template>
  <audio ref="audioEle" hidden />
  <TransitionGroup name="fade">
    <div v-show="groupActive === 'upload'" key="music-upload" fixed inset-0 bg-white>
      <div max-w-80vw mx-auto z-1 py-xl>
        <Uploader :on-file-change="onFileChange" accept="audio/*" multiple title="点击或拖拽上传本地音乐" />

        <div my-xl>
          <div
            v-for="file in files" :key="file.name"
            py-sm px-xl bg-bg-b mb-xl rounded-xl hover:bg-bg-b-hover transition cursor-pointer
          >
            {{ file.name }}
          </div>
        </div>
      </div>
      <div fixed bottom-10 left="1/2" translate-x="-50%">
        <div
          bg-black p-xs flex-center cursor-pointer hover:bg-black:90 rounded="1/2"
          @click="groupActive = 'main'"
        >
          <Icon name="fluent:checkmark-24-regular" w-6 h-6 text-white />
        </div>
      </div>
    </div>

    <div v-show="groupActive === 'main'" key="music-main" w-full h-100vh bg-white fcol>
      <div flex-1 w-full>
        <h1 text-xl px-xl py-xs>
          歌曲列表
        </h1>
        <hr border-divider border-none border-t-solid>
        <div
          v-for="file in files" :key="file.name"
          border="~ b-solid divider" px-4 py-2 frow justify-between hover:bg-bg-b-hover transition
          first-border-t-solid
        >
          <div>
            {{ file.name }}
          </div>
          <div w-8 h-8 flex-center rounded="1/2" border="~ solid divider" text-4 cursor-pointer>
            <Icon name="fluent:play-24-regular" />
          </div>
        </div>
        <div ref="waveEle" w-full />
      </div>
      <div w-full frow shadow border="~ t-solid divider" py-2 gap-2 px-4>
        <div flex-1 cursor-pointer @click="groupActive = 'detail'">
          {{ currentFile?.name || '点击加号添加音乐' }}
        </div>
        <div w-10 h-10 flex-center rounded="1/2" border="~ solid divider" text-5 cursor-pointer @click="play">
          <Icon name="fluent:play-24-regular" />
        </div>
        <div w-10 h-10 flex-center rounded="1/2" border="~ solid divider" text-5 cursor-pointer @click="groupActive = 'upload'">
          <Icon name="fluent:add-24-regular" />
        </div>
      </div>
    </div>

    <div v-show="groupActive === 'detail'" key="music-main" fixed w-full h-100vh bg-white fcol items-stretch>
      <div frow justify-between px-xl pt-xl>
        <div bg-bg-c p-xs rounded="1/2" cursor-pointer @click="groupActive = 'main'">
          <Icon name="fluent:arrow-hook-up-left-24-regular" w-6 h-6 text-text-second />
        </div>
        <div>
          {{ currentFile?.name }}
        </div>
        <div bg-bg-c p-xs rounded="1/2" cursor-pointer @click="groupActive = 'upload'">
          <Icon name="fluent:add-24-regular" w-6 h-6 text-text-second />
        </div>
      </div>
      <!--  -->

      <div flex-1 w-full>
        <!-- 频谱 -->
      </div>

      <div frow justify-center gap-xl py-xs>
        <div p-2 rounded="1/2" bg-black text-white cursor-pointer>
          <Icon name="fluent:previous-24-regular" w-6 h-6 />
        </div>

        <div p-xs rounded="1/2" bg-black text-white cursor-pointer>
          <Icon name="fluent:play-24-regular" w-8 h-8 />
          <!-- <Icon name="fluent:pause-24-regular" /> -->
        </div>
        <div p-2 rounded="1/2" bg-black text-white cursor-pointer>
          <Icon name="fluent:next-24-regular" w-6 h-6 />
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<style lang="scss" scoped>
</style>
