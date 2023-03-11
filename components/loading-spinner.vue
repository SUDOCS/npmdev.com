<script setup lang="ts">
const props = withDefaults(defineProps<{
  theme?: 'light' | 'dark'
  size?: 'small' | 'medium' | 'large'
}>(), {
  theme: 'dark',
  size: 'small',
})

const { theme } = toRefs(props)
</script>

<template>
  <div
    class="loading-spinner"
    :class="{
      'loading-spinner-black': theme === 'dark',
      'loading-spinner-white': theme === 'light',
      'w-5 h-5': size === 'small',
      'w-10 h-10': size === 'medium',
      'w-20 h-20': size === 'large',
    }"
  />
</template>

<style lang="scss" scoped>
@keyframes loading-spinner {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
.loading-spinner{
    @apply relative;

    &:before{
        @apply absolute-full content-none border-4px border-black/10 border-solid rounded-1/2;
    }

    &:after{
        @apply absolute-full content-none border-4px border-solid rounded-1/2;
        border-color: black transparent transparent transparent;
        animation: loading-spinner 1s linear infinite;
    }

    &-black{
        &:before{
            @apply border-white/30;
        }

        &:after{
            border-color: white transparent transparent transparent;
        }
    }

    &-white{
        &:before{
            @apply border-black/10;
        }

        &:after{
            border-color: black transparent transparent transparent;
        }
    }
}
</style>
