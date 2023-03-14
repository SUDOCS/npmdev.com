import wallpapers from 'virtual:wallpaper-auto-scanner'
import Preference from '~~/utils/preference'

const WallpaperKey = 'wallpaper'

export const useWallpaper = defineStore('wallpaper', () => {
  const currentIdx = ref(8)

  const randomIdx = ref(Math.floor(Math.random() * wallpapers.length))

  const currentWallpaper = computed(() => wallpapers[currentIdx.value])

  const randomWallpaper = computed(() => wallpapers[randomIdx.value])

  onMounted(() => {
    const idx = Preference.get(WallpaperKey)
    if (idx) {
      currentIdx.value = parseInt(idx)
    }
  })

  function nextWallpaper() {
    currentIdx.value = (currentIdx.value + 1) % wallpapers.length
    Preference.set(WallpaperKey, currentIdx.value, -1)
  }

  return {
    wallpapers,
    currentWallpaper,
    randomWallpaper,
    nextWallpaper,
  }
})
