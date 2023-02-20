import presetWebFonts from '@unocss/preset-web-fonts'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import type { Preset } from 'unocss'
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import { defineConfig } from 'unocss/vite'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetWebFonts({
      provider: 'google', // default provider
      fonts: {
        // these will extend the default theme
        sans: 'Noto Serif SC',
        mono: ['Fira Code', 'Fira Mono:400,700'],
        // custom ones
        lobster: 'Lobster',
        lato: [
          {
            name: 'Lato',
            weights: ['400', '700'],
            italic: true,
          },
          {
            name: 'sans-serif',
            provider: 'none',
          },
        ],
      },
    }) as Preset,
  ],
  transformers: [
    transformerDirectives(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    transformerVariantGroup(),
  ],
  shortcuts: {
    'wh-full': 'w-full h-full',
    'absolute-full': 'absolute inset-0',
    'absolute-center': 'absolute left-1/2 top-1/2 translate-x--1/2 translate-y--1/2',
    'absolute-x-center': 'absolute left-1/2 translate-x--1/2',
    'flex-center': 'flex justify-center items-center',
    'frow': 'flex flex-row items-center',
    'fcol': 'flex flex-col items-center',
    'text-owt': 'overflow-hidden whitespace-nowrap text-ellipsis',
  },
})
