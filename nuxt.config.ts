import fs from 'fs'
import path from 'path'
import { execa } from 'execa'
import svgToMiniDataURI from 'mini-svg-data-uri'
import { defineNuxtConfig } from 'nuxt/config'
import viteCompression from 'vite-plugin-compression'
import { author, devDependencies, name, version } from './package.json'

const wallpaperModuleId = 'virtual:wallpaper-auto-scanner'
const buildInfoModuleId = 'virtual:build-info'

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
        enforce: 'pre',
        load(id) {
          if (!id.endsWith('.svg?inline'))
            return

          const svg = fs.readFileSync(path.resolve(id.replace('?inline', '')), 'utf-8')
          return `export default "${svgToMiniDataURI(svg)}"`
        },
      },
      {
        name: 'wallpaper-auto-scanner',
        enforce: 'pre',
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
      {
        name: 'build-info',
        enforce: 'pre',
        resolveId(id) {
          if (id === buildInfoModuleId)
            return id
        },
        async load(id) {
          if (id === buildInfoModuleId) {
            const { stdout } = await execa('git rev-parse --short HEAD')
            const buildInfo: BuildInfo = {
              name,
              version,
              commitHash: stdout.trim(),
              author,
              devDependencies,
              buildDate: new Date().valueOf(),
            }
            return `export default ${JSON.stringify(buildInfo)}`
          }
        },
      },
      viteCompression(),
      viteCompression({
        algorithm: 'brotliCompress',
      }),
    ],
  },
  css: [
    '@/assets/common.scss',
  ],
  ssr: false,
})
