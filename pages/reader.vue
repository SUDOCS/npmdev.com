<script setup lang="ts">
import * as pdfLib from 'pdfjs-dist'
import * as pdfViewer from 'pdfjs-dist/web/pdf_viewer'

import 'pdfjs-dist/web/pdf_viewer.css'

pdfLib.GlobalWorkerOptions.workerSrc = '//unpkg.com/browse/pdfjs-dist@3.4.120/lib/pdf.worker.js'

const pdfContainer = ref()

const file = shallowRef<File>()

console.log(pdfViewer)
const eventBus = new pdfViewer.EventBus()

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
    const scale = 2
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
</script>

<template>
  <Transition v-show="!file" name="fade">
    <div fixed inset-0 flex-center z-1>
      <Uploader w-80 lg:w-120 :on-file-change="onFileChange" accept="application/pdf" />
    </div>
  </Transition>
  <div ref="pdfContainer" w-full h-100vh frow justify-center gap-xs flex-wrap relative />
</template>

<style lang="scss" scoped>
:deep(.page){
  @apply relative;
}
</style>
