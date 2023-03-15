<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  length?: number
}>(), {
  modelValue: '',
  length: 6,
})

const emits = defineEmits(['update:modelValue'])

const text = computed({
  get() {
    return props.modelValue
  },
  set(val: string) {
    emits('update:modelValue', val)
  },
})

const active = ref(-1)
const inputEl = ref<HTMLInputElement>()
const isLargeScreen = useMediaQuery('(min-width: 1024px)')

function activeInput() {
  inputEl.value?.focus()
  if (active.value === -1) {
    if (text.value.length === 0) {
      active.value = 0
    }
    else {
      active.value = text.value.length - 1
    }
  }
}

function onInputChange(event: Event) {
  const val = (event.target as HTMLInputElement).value
  if (val.length > props.length) {
    text.value = val.slice(0, props.length)
    ;(inputEl.value as HTMLInputElement).value = text.value
  }
  else {
    text.value = val
    active.value = val.length - 1
  }
}

onMounted(() => {
  if (text.value.length > 0 && isLargeScreen.value) {
    (inputEl.value as HTMLInputElement).focus()
    active.value = text.value.length - 1
  }
})
</script>

<template>
  <div relative text-20px @click="activeInput">
    <input ref="inputEl" type="text" :value="props.modelValue" class="serial-number-input" autocomplete="off" @input="onInputChange">
    <div frow gap-1em flex-center flex-wrap>
      <div
        v-for="(_, idx) in length" :key="idx" class="serial-number-box"
        :class="{ 'serial-number-box-active': active === idx }"
      >
        {{ text.at(idx) }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.serial-number-input{
    @apply absolute top-0 left-0 right-0 left-0 border-none bg-transparent outline-none opacity-0.5 z-1;
}
.serial-number-box{
  @apply w-2em h-2em lh-2em inline-block text-center bg-black/5  rounded-xl;

  &-active{
    @apply border border-black/60 border-solid;
  }
}
</style>
