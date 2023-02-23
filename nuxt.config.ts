import fs from 'fs'
import path from 'path'
import svgToMiniDataURI from 'mini-svg-data-uri'
import { defineNuxtConfig } from 'nuxt/config'

const wallpaperModuleId = 'virtual:wallpaper-auto-scanner'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-icon',
  ],
  imports: {
    dirs: ['./stores', './applets'],
  },
  pinia: {
    autoImports: ['defineStore', 'storeToRefs'],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/_var.scss" as *;',
        },
      },
    },
    plugins: [
      {
        name: 'svg-inline-loader',
        load(id) {
          if (!id.endsWith('.svg?inline'))
            return

          const svg = fs.readFileSync(path.resolve(id.replace('?inline', '')), 'utf-8')
          return `export default "${svgToMiniDataURI(svg)}"`
        },
      },
      {
        name: 'wallpaper-auto-scanner',
        resolveId(id) {
          if (id === wallpaperModuleId)
            return id
        },
        load(id) {
          if (id === wallpaperModuleId) {
            const files = fs.readdirSync(path.resolve('./public/wallpapers'))
            const wallpapers = files.map(file => `/wallpapers/${file}`)
            return `export default ${JSON.stringify(wallpapers)}`
          }
        },
      },
    ],
  },
  css: [
    '@/assets/common.scss',
  ],
})
