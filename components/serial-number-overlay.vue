<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  show: boolean
  autoGenerate?: boolean
  title: string
  subtitle?: string
  errorTips?: string
  loading: boolean
  open: () => void
}>(), {
  errorTips: '请输入6位序列号',
  open: () => {},
  autoGenerate: false,
  subtitle: '',
})

const emits = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const { show, autoGenerate, loading, errorTips } = toRefs(props)
const showTips = ref(false)

const serialVal = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  },
})

function generateRoomId() {
  serialVal.value = Math.random().toString(10).slice(2, 8)
}

function start() {
  if (serialVal.value && serialVal.value.length === 6) {
    props.open()
  }
  else {
    showTips.value = true
  }
}
</script>

<template>
  <div v-show="show" absolute inset-0 fcol justify-center gap-10 p-10 z-1 bg-white>
    <div text-center>
      <h1>
        {{ title }}
      </h1>

      <span>{{ subtitle }}</span>

      <SerialNumber v-model="serialVal" py-xl />

      <div v-show="autoGenerate" underline cursor-pointer @click="generateRoomId">
        一键随机生成
      </div>
    </div>

    <div
      w-4em h-4em lh-4em rounded="50%" text-center mx-auto text-white cursor-pointer
      my-xl shadow transition flex-center bg-black
    >
      <loading-spinner v-if="loading" />
      <span v-else @click="start">开启</span>
    </div>

    <span :style="{ visibility: showTips === true ? 'visible' : 'hidden' }" text-red>{{ errorTips }}</span>
  </div>
</template>

<style lang="scss" scoped>
</style>
