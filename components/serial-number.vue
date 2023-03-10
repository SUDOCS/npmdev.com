<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: string
  length?: number
}>(), {
  value: '',
  length: 6,
})

const emits = defineEmits(['update:value'])

const text = ref(props.value)
const active = ref(props.value.length - 1)
const inputEl = ref<HTMLInputElement>()

function onClicked(event: Event) {
  const target = event.target
  console.log(target)
}

function activeInput() {
  inputEl.value?.focus()
  if (active.value === -1) {
    active.value = 0
  }
}

function onInputChange(event: Event) {
//   console.log('input change', event)
  const val = (event.target as HTMLInputElement).value
  if (val.length > props.length) {
    text.value = val.slice(0, props.length)
    ;(inputEl.value as HTMLInputElement).value = text.value
  }
  else {
    text.value = val
    active.value = val.length - 1
    emits('update:value', val)
  }
}

onMounted(() => {
  if (props.value.length > 0) {
    (inputEl.value as HTMLInputElement).focus()
  }
})
</script>

<template>
  <div relative text-20px @click="activeInput">
    <input ref="inputEl" type="text" :value="props.value" class="serial-number-input" @input="onInputChange">
    <div frow gap-1em flex-center flex-wrap @click="onClicked">
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
