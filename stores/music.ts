import type { LocalMusicFile } from './../utils/music'

export const NetworkMusicListStorgeKey = 'NetworkMusicListStorgeKey'
export const CurrentMusicFileIdx = 'CurrentMusicFileIdx'

export const useMusicStore = defineStore('music', () => {
  const networkMusicList = useLocalStorage(NetworkMusicListStorgeKey, [
    new NetworkMusicFile(
      '初心-潘辰',
      'https://npmdev.oss-cn-hangzhou.aliyuncs.com/%E5%88%9D%E5%BF%83-%E6%BD%98%E8%BE%B0.128.mp3',
    ),
    new NetworkMusicFile(
      '雲流れ - みかん箱,Foxtail-Grass Studio',
      'https://npmdev.oss-cn-hangzhou.aliyuncs.com/%E9%9B%B2%E6%B5%81%E3%82%8C%20-%20%E3%81%BF%E3%81%8B%E3%82%93%E7%AE%B1%2CFoxtail-Grass%20Studio.mp3',
    ),
  ], { shallow: true })

  const localMusicList = shallowRef<LocalMusicFile[]>([])

  const playList = computed(() => {
    return [...networkMusicList.value, ...localMusicList.value]
  })

  const currentFileIdx = useLocalStorage(CurrentMusicFileIdx, 0)
  const currentFile = computed(() => playList.value[currentFileIdx.value])

  function addMusic(music: LocalMusicFile) {
    localMusicList.value = [...localMusicList.value, music]
  }

  onUnmounted(() => {
    localStorage.removeItem(NetworkMusicListStorgeKey)
    localStorage.removeItem(CurrentMusicFileIdx)
  })

  return {
    playList,
    currentFile,
    currentFileIdx,
    addMusic,
  }
})
