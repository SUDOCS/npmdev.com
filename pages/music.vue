<script setup lang="ts">
import type { MusicFile } from '~~/utils/music'

const groupActive = ref<'main' | 'upload'>('main')
const showPlayList = ref(false)
const playList = shallowRef<MusicFile[]>([])
const canvasContainer = ref()

const { playing, currentFile, playOrPause, toggleStyle, nextMusic, prevMusic, startPlayFile } = useMusicVisualizer({ fftSize: 64, canvasContainer, playList })

function onFileChange(fl: FileList) {
  const fileNames = playList.value
    .filter(f => f.origin === MusicFileOrigin.Local)
    .map(f => f.name)

  for (let i = 0; i < fl.length; i++) {
    const file = Object.values(fl)[i]

    if (!fileNames.includes(file.name)) {
    // 新文件
      const musicFile = new LocalMusicFile(file)
      playList.value = [...playList.value, musicFile]
    }
  }
}

onMounted(() => {
  // https://api.oick.cn/wyy/api.php?id=785902
  playList.value = [
    new NetworkMusicFile(
      '雲流れ - みかん箱,Foxtail-Grass Studio',
      'https://npmdev.oss-cn-hangzhou.aliyuncs.com/%E9%9B%B2%E6%B5%81%E3%82%8C%20-%20%E3%81%BF%E3%81%8B%E3%82%93%E7%AE%B1%2CFoxtail-Grass%20Studio.mp3',
    ),
    new NetworkMusicFile(
      '初心-潘辰',
      'https://npmdev.oss-cn-hangzhou.aliyuncs.com/%E5%88%9D%E5%BF%83-%E6%BD%98%E8%BE%B0.128.mp3',
    ),
  ]
})
</script>

<template>
  <TransitionGroup name="fade">
    <div v-show="groupActive === 'upload'" key="music-upload" fixed inset-0 select-none>
      <div max-w-80vw h-full mx-auto z-1 py-xl fcol justify-center items-stretch>
        <Uploader :on-file-change="onFileChange" accept="audio/*" multiple title="点击或拖拽上传本地音乐" />

        <div my-xl>
          <div
            v-for="file in playList" :key="file.name"
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

    <div v-show="groupActive === 'main'" key="music-main" w-full h-100vh fcol relative overflow-hidden select-none @click="showPlayList = false">
      <div w-full frow justify-between px-xl pt-xl>
        <div w-10 h-10 flex-center bg-white rounded="1/2" border="~ solid divider" text-4 cursor-pointer @click="toggleStyle">
          <Icon name="fluent:style-guide-24-regular" />
        </div>
        <div>
          {{ currentFile?.name || '点击加号添加音乐' }}
        </div>
        <div
          w-10 h-10 flex-center bg-white rounded="1/2" border="~ solid divider" text-4 cursor-pointer
          @click="groupActive = 'upload'"
        >
          <Icon name="fluent:add-24-regular" />
        </div>
      </div>

      <div ref="canvasContainer" text-center w-full h-60vh overflow-hidden />

      <!-- controls -->
      <div frow justify-center gap-xl py-xl>
        <div w-12 h-12 flex-center bg-white rounded="1/2" cursor-pointer @click="prevMusic">
          <Icon name="fluent:previous-24-regular" />
        </div>
        <div w-15 h-15 flex-center bg-white rounded="1/2" cursor-pointer @click="playOrPause">
          <Icon v-show="!playing" name="fluent:play-24-regular" />
          <Icon v-show="playing" name="fluent:pause-24-regular" />
        </div>
        <div w-12 h-12 flex-center bg-white rounded="1/2" cursor-pointer @click="nextMusic">
          <Icon name="fluent:next-24-regular" />
        </div>
      </div>

      <div fixed bottom-0 w-full shadow border="~ t-solid divider">
        <!-- 歌单 -->
        <div
          absolute top-0 left-0 right-0 z-0 bg-white transition="transform ease-out" border="~ t-solid divider"
          :class="{ 'translate-y-0': !showPlayList, 'translate-y--100%': showPlayList }"
        >
          <div v-if="playList.length !== 0">
            <div
              v-for="(file, idx) in playList" :key="file.name"
              border="~ b-solid divider" px-4 py-2 frow justify-between
            >
              <div>
                {{ file.name }}
              </div>
              <div
                w-8 h-8 flex-center rounded="1/2" border="~ solid divider" hover:bg-bg-b-hover transition text-4 cursor-pointer
                @click="startPlayFile(idx)"
              >
                <Icon name="fluent:play-24-regular" />
              </div>
            </div>
          </div>
          <div v-else px-xl py-xs>
            暂无歌曲
          </div>
        </div>

        <div frow py-2 gap-2 px-4 relative z-2 bg-white>
          <div
            w-10 h-10 flex-center rounded="1/2" border="~ solid divider" text-5 cursor-pointer
            @click="playOrPause"
          >
            <Icon v-show="!playing" name="fluent:play-24-regular" />
            <Icon v-show="playing" name="fluent:pause-24-regular" />
          </div>
          <div flex-1 cursor-pointer>
            {{ currentFile?.name || '点击加号添加音乐' }}
          </div>
          <div
            w-10 h-10 flex-center rounded="1/2" border="~ solid divider" text-5 cursor-pointer
            @click.stop="showPlayList = !showPlayList"
          >
            <Icon name="fluent:apps-list-detail-24-regular" />
          </div>
        </div>
      </div>
    </div>
  </TransitionGroup>
</template>

<style lang="scss" scoped>
</style>
