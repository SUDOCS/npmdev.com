import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    // '@nuxt/devtools',
    '@unocss/nuxt',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/_var.scss" as *;',
        },
      },
    },
  },
  css: [
    '@/assets/common.scss',
  ],
})
