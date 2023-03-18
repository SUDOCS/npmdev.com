import type { MusicFile } from './../utils/music'
export interface UseAudioMediaAnalyserOptions {
  fftSize: number
  canvasContainer: Ref<HTMLDivElement>
  playList: Ref<MusicFile[]>
}

enum VisualizerStyle {
  OuterStrockInnerStrock = 0,
  OuterStrockInnnerFill,
  OuterDotInnerStrock,
}

export function useMusicVisualizer(options: UseAudioMediaAnalyserOptions) {
  const { fftSize, canvasContainer, playList } = options

  const { width, height } = useElementSize(canvasContainer)

  let audio: HTMLAudioElement | undefined
  const audioContext = ref<AudioContext >()
  let audioSource: MediaElementAudioSourceNode | undefined
  let analyser: AnalyserNode | undefined

  let frequencyData: Uint8Array

  let canvasEle: HTMLCanvasElement | undefined
  let canvasContext: CanvasRenderingContext2D | undefined

  //   半径
  let radius = 160
  // canvas 中心点
  let centerX = 200
  let centerY = 200

  // 起始角度
  let startAngle = -Math.PI / 2

  // 振幅
  const amplitude = 40

  const playing = ref(false)

  const style = ref<VisualizerStyle>(VisualizerStyle.OuterStrockInnerStrock)

  let rotateInterval: NodeJS.Timeout | undefined

  function initCanvas() {
    canvasEle = document.createElement('canvas')
    canvasContext = canvasEle.getContext('2d') as CanvasRenderingContext2D

    resetCanvas()
  }

  function resetCanvas() {
    if (canvasEle && canvasContext) {
      const scaleFactor = window.devicePixelRatio > 1 ? window.devicePixelRatio : 1

      canvasEle.width = width.value * scaleFactor
      canvasEle.height = height.value * scaleFactor
      canvasEle.style.width = `${width.value}px`
      canvasEle.style.height = `${height.value}px`

      centerX = width.value / 2
      centerY = height.value / 2

      radius = Math.min(width.value, height.value) / 2 * 0.7

      canvasContext.scale(scaleFactor, scaleFactor)
      canvasContext.lineWidth = 2
      canvasContext.lineCap = 'round'
      canvasContext.strokeStyle = '#00AEEC'
    }
  }

  function initAudioMediaAnalyser(audio: HTMLAudioElement) {
    const context = new AudioContext()
    audioSource = context.createMediaElementSource(audio)

    analyser = context.createAnalyser()

    audioSource.connect(analyser)
    analyser.connect(context.destination)

    analyser.fftSize = fftSize

    frequencyData = new Uint8Array(analyser.frequencyBinCount)

    audioContext.value = context
  }

  async function renderFrequency() {
    if (!canvasContext || !playing.value) {
      return
    }

    resetCanvas()

    analyser?.getByteFrequencyData(frequencyData)

    const { innerPointers, outerPointers } = calcInnerAndOuterPointers(frequencyData)

    renderAccrodingToStyle(innerPointers, outerPointers)

    setTimeout(() => {
      requestAnimationFrame(renderFrequency)
    }, 1000 / 60)
  }

  function calcInnerAndOuterPointers(buffer: Uint8Array) {
    const innerPointers = []
    const outerPointers = []

    const sliceData = buffer.slice(0, buffer.length)

    const data = [...sliceData, ...[...sliceData].reverse()]

    const angle = (Math.PI * 2) / data.length

    for (let i = 0; i < data.length; i++) {
      const value = Math.exp(data[i] / 255 * Math.log(2)) - 1
      const innerRadius = radius - amplitude * 0.5 * value
      const outerRadius = radius + amplitude * 1.0 * value

      const innerPointX = centerX + Math.cos(startAngle + i * angle) * innerRadius
      const innerPointY = centerY + Math.sin(startAngle + i * angle) * innerRadius
      const outerPointX = centerX + Math.cos(startAngle + i * angle) * outerRadius
      const outerPointY = centerY + Math.sin(startAngle + i * angle) * outerRadius

      innerPointers.push(innerPointX, innerPointY)
      outerPointers.push(outerPointX, outerPointY)
    }

    return {
      innerPointers,
      outerPointers,
    }
  }

  function createRegion(pointers: number[]) {
    const innerRegion = new Path2D()
    innerRegion.moveTo(pointers[0], pointers[1])

    for (let i = 0; i < pointers.length; i += 2) {
      const innerPointX = pointers[i]
      const innerPointY = pointers[i + 1]

      innerRegion.lineTo(innerPointX, innerPointY)
    }
    innerRegion.closePath()

    return innerRegion
  }

  function renderAccrodingToStyle(innerPointers: number[], outerPointers: number[]) {
    switch (style.value) {
      case VisualizerStyle.OuterStrockInnerStrock:{
        renderOuterStrockInnerStroke(innerPointers, outerPointers)
        break
      }
      case VisualizerStyle.OuterStrockInnnerFill:{
        renderOuterDotInnerFill(innerPointers, outerPointers)
        break
      }
      case VisualizerStyle.OuterDotInnerStrock:{
        renderOuterDotInnerStroke(innerPointers, outerPointers)
        break
      }
    }
  }

  // 外圈描边，内圈描边
  function renderOuterStrockInnerStroke(innerPointers: number[], outerPointers: number[]) {
    if (!canvasContext)
      return

    const innerRegion = createRegion(innerPointers)

    const outerRegion = createRegion(outerPointers)

    canvasContext.stroke(innerRegion)
    canvasContext.stroke(outerRegion)

    canvasContext.beginPath()
    for (let i = 0; i < innerPointers.length; i += 2) {
      const innerPointX = innerPointers[i]
      const innerPointY = innerPointers[i + 1]

      canvasContext.moveTo(innerPointX, innerPointY)
      canvasContext.lineTo(outerPointers[i], outerPointers[i + 1])
    }
    canvasContext.stroke()
  }

  // 外圈描点，内圈填充
  function renderOuterDotInnerFill(innerPointers: number[], outerPointers: number[]) {
    if (!canvasContext)
      return

    const innerRegion = createRegion(innerPointers)
    const outerRegion = createRegion(outerPointers)

    canvasContext.stroke(outerRegion)

    const path = new Path2D()
    for (let i = 0; i < outerPointers.length - 2; i += 2) {
      const outerPointX = outerPointers[i]
      const outerPointY = outerPointers[i + 1]
      path.moveTo(centerX, centerY)
      path.lineTo(outerPointX, outerPointY)
    }
    canvasContext.stroke(path)

    const gradient = getGradient(canvasContext)
    canvasContext.fillStyle = gradient
    canvasContext.fill(innerRegion)
  }

  // 外圈描点，内圈描边
  function renderOuterDotInnerStroke(innerPointers: number[], outerPointers: number[]) {
    if (!canvasContext)
      return

    const innerRegion = createRegion(innerPointers)

    const path = new Path2D()
    for (let i = 0; i < outerPointers.length - 2; i += 2) {
      const outerPointX = outerPointers[i]
      const outerPointY = outerPointers[i + 1]
      path.moveTo(centerX, centerY)
      path.lineTo(outerPointX, outerPointY)
    }
    canvasContext.lineWidth = 5
    canvasContext.lineCap = 'round'
    canvasContext.stroke(path)

    const gradient = getGradient(canvasContext)
    canvasContext.fillStyle = gradient
    canvasContext.fill(innerRegion)
  }

  function getGradient(context: CanvasRenderingContext2D) {
    const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)

    gradient.addColorStop(1 / 5, '#15559a')
    gradient.addColorStop(2 / 5, '#0f59a4')
    gradient.addColorStop(3 / 5, '#1661ab')
    gradient.addColorStop(4 / 5, '#2775b6')
    gradient.addColorStop(5 / 5, '#2b73af')

    return gradient
  }

  function drawDemo() {
    if (canvasContext) {
      resetCanvas()

      const data = new Uint8Array(fftSize / 2).fill(0)
      const { innerPointers, outerPointers } = calcInnerAndOuterPointers(data)

      renderAccrodingToStyle(innerPointers, outerPointers)
    }
  }

  const currentFileIdx = ref(0)
  const currentFile = computed(() => playList.value[currentFileIdx.value])

  watch([width, height], ([w, h]) => {
    centerX = w / 2
    centerY = h / 2
    radius = Math.min(w, h) / 2 * 0.7

    if (!playing.value) {
      console.log(w, h)
      drawDemo()
    }
  })

  watch(style, () => {
    if (!playing.value) {
      drawDemo()
    }
  })

  watch(playing, (val) => {
    if (val) {
      rotateInterval = setInterval(() => {
        startAngle += Math.PI * 2 / frequencyData.length / 60
      }, 1000 / 60)

      renderFrequency()
    }
    else {
      rotateInterval && clearInterval(rotateInterval as NodeJS.Timeout)
    }
  })

  function createAudioAndPlay(file: MusicFile) {
    audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.src = file.url

    audio.onplay = () => {
      playing.value = true
    }

    audio.onended = () => {
      playing.value = false
      currentFileIdx.value = (currentFileIdx.value + 1) % playList.value.length
    }

    initAudioMediaAnalyser(audio)
    audio.play()
  }

  function playOrPause() {
    if (playList.value.length === 0) {
      return
    }

    if (playing.value) {
      audio?.pause()
    }
    else {
      if (audio) {
        audio.play()
      }
      else {
        startPlayFile(currentFileIdx.value)
      }
    }

    playing.value = !playing.value
  }

  watch(currentFileIdx, (newIdx) => {
    startPlayFile(newIdx)
  })

  function startPlayFile(fileIdx: number) {
    playing.value = false // 先令渲染停止，后续会被 onplay 事件设置为 true
    destroyAudio()
    const file = playList.value[fileIdx]
    createAudioAndPlay(file)
    currentFileIdx.value = fileIdx
  }

  function toggleStyle() {
    style.value = (style.value + 1) % 3 as VisualizerStyle
  }

  function destroyAudio() {
    audioContext.value?.close()
    audioContext.value = undefined
    rotateInterval && clearInterval(rotateInterval)
    audioSource = undefined
    analyser = undefined
    audio = undefined
  }

  function prevMusic() {
    currentFileIdx.value = (currentFileIdx.value - 1 + playList.value.length) % playList.value.length
  }

  function nextMusic() {
    currentFileIdx.value = (currentFileIdx.value + 1) % playList.value.length
  }

  onMounted(() => {
    initCanvas()

    // 挂载 canvas
    canvasContainer.value.innerHTML = ''
    canvasContainer.value.appendChild(canvasEle!)

    drawDemo()
  })

  onUnmounted(() => {
    destroyAudio()
  })

  return {
    audioContext,
    playing,
    currentFile,
    playOrPause,
    toggleStyle,
    startPlayFile,
    prevMusic,
    nextMusic,
  }
}
