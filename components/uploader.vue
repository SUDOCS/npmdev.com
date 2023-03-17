<script setup lang="ts">
const props = withDefaults(defineProps<{
  accept?: string
  multiple?: boolean
  title?: string
  subtitle?: string
  disable?: boolean
  disabledMsg?: string
  onFileChange: (list: FileList) => void
}>(), {
  title: '点击或拖拽上传',
  subtitle: '请勿上传敏感数据',
  disable: false,
  disabledMsg: '需同时在线才能上传',
})

const { disable } = toRefs(props)

function fileDragEnter(e: DragEvent) {
  e.preventDefault()
}

function fileDrop(e: DragEvent) {
  e.preventDefault()
  if (disable.value) {
    return
  }
  const fl = e.dataTransfer?.files
  if (fl && Object.values(fl).length > 0) {
    props.onFileChange(fl)
  }
}

function fileDragOver(e: DragEvent) {
  e.preventDefault()
}

function onFileInput(e: Event) {
  const fl = (e.target as HTMLInputElement).files
  if (fl && Object.values(fl).length > 0) {
    props.onFileChange(fl)
  }
}
</script>

<template>
  <div
    relative border border-divider border-dashed hover:border-primary bg-bg-a rounded-2 transition
    :class="{
      'grayscale-100': disable,
    }"
    @dragenter="fileDragEnter" @dragover="fileDragOver"
    @drop="fileDrop"
  >
    <input
      type="file" :multiple="props.multiple" :accept="props.accept" :disabled="disable"
      absolute-full opacity-0 cursor-pointer
      :class="{
        'cursor-not-allowed': disable,
      }"
      :title="disable ? disabledMsg : '点击上传'"
      @change="onFileInput"
    >
    <div text-center py-4>
      <Icon name="fluent:arrow-upload-24-regular" w-10 h-10 text-text-second />

      <div text-xl my-2>
        {{ title }}
      </div>
      <div text-text-second text-sm>
        {{ subtitle }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
