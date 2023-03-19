<script setup lang="ts">
import * as pdfLib from 'pdfjs-dist'
import * as pdfViewer from 'pdfjs-dist/web/pdf_viewer'

import 'pdfjs-dist/web/pdf_viewer.css'

pdfLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'

const pdfContainer = ref()

const file = shallowRef<File>()

console.log(pdfViewer)
const eventBus = new pdfViewer.EventBus()

const { text: selectedText, rects: selectedRects, ranges: selectedRanges } = useTextSelection()
const showPopup = ref(false)
const translation = ref('')
const showTranslation = ref(false)
const translationRect = ref({ top: '0', left: '0' })

const url = ref('')

const { data, execute } = useFetch(url, { immediate: false })

function onFileChange(fl: FileList) {
  if (Object.keys(fl).length === 0)
    return

  file.value = Object.values(fl)[0]
}

watch(file, (val) => {
  if (val) {
    renderPDF()
  }
})

async function renderPDF() {
  const pdf = await pdfLib.getDocument(URL.createObjectURL(file.value!)).promise

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)

    console.log(page)
    const scale = 1.5
    const pdfPageView = new pdfViewer.PDFPageView({
      container: pdfContainer.value,
      id: i,
      scale,
      defaultViewport: page.getViewport({ scale }),
      eventBus,
    })

    pdfPageView.setPdfPage(page)
    pdfPageView.draw()
  }
}

async function fetchTransitionResult() {
  showTranslation.value = false
  const encode = encodeURIComponent(selectedText.value)
  url.value = `/proxy/youdao/translate?&doctype=json&type=AUTO&i=${encode}`
  await execute()

  console.log(data.value)

  const { errorCode, translateResult } = (data.value || {}) as any
  if (errorCode === 0) {
    translation.value = translateResult.map((item: any) => item[0].tgt).join('')
  }
  else {
    translation.value = '翻译失败'
  }
  showTranslation.value = true
}

function onSelectionChange() {
  if (!selectedText.value) {
    showPopup.value = false
    return
  }
  showPopup.value = true
  const { top, left, width } = selectedRects.value[0]
  translationRect.value = {
    top: `${top - 13}px`,
    left: `${left + width / 2}px`,
  }
  fetchTransitionResult()
  console.log(selectedText.value, selectedRects.value, selectedRanges.value)
}

const onSelectionChangeDebounced = useDebounceFn(onSelectionChange, 500)

watch(selectedText, () => {
  onSelectionChangeDebounced()
})
</script>

<template>
  <Transition v-show="!file" name="fade">
    <div fixed inset-0 flex-center z-1>
      <Uploader
        w-80 lg:w-120 :on-file-change="onFileChange"
        accept="application/pdf" title="点击或拖拽加载本地PDF文档" subtitle=""
      />
    </div>
  </Transition>
  <div ref="pdfContainer" w-full h-100vh frow justify-center gap-xs flex-wrap relative />

  <div
    v-show="showPopup" fixed translate-x="-1/2" translate-y="-1/1" bg-white rounded-xl shadow
    border="~ divider solid" px-xl py-xs
    :style="translationRect"
  >
    <!-- 翻译 -->

    <div v-show="!showTranslation" w-full flex-center>
      <LoadingSpinner theme="light" />
    </div>
    <div v-show="showTranslation">
      {{ translation }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.page){
  @apply relative;
}
</style>
