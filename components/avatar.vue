<script setup lang="ts">
withDefaults(defineProps<{
  name: string
  length?: number
  size?: 'small' | 'medium' | 'large'
}>(),
{
  length: 4,
  size: 'medium',
})
</script>

<template>
  <div
    text-center bg-avatar-bg rounded="1/2" border="~ solid divider"
    :class="{
      'w-12 h-12 lh-12': size === 'small',
      'w-16 h-16 lh-16': size === 'medium',
      'w-20 h-20 lh-20': size === 'large',
    }"
  >
    {{ name.toString().slice(0, length) }}
  </div>
</template>

<style lang="scss" scoped>
</style>
