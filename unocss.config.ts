import transformerDirectives from '@unocss/transformer-directives'
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import { defineConfig } from 'unocss/vite'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  transformers: [
    transformerDirectives(),
  ],
})
