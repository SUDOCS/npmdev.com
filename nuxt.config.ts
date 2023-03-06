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
        name: 'build-info-generator',
        enforce: 'pre',
        resolveId(id) {
          if (id === buildInfoModuleId)
            return id
        },
        async load(id) {
          if (id === buildInfoModuleId) {
            let commitHash
            if (process.env.VERCEL || process.env.CI) {
              // 在 Vercel 或 CI 中运行
              commitHash = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA)?.slice(0, 7) as string
            }
            else {
              // 在本地运行
              commitHash = (await execa('git rev-parse --short HEAD')).stdout
            }
            const buildInfo: BuildInfo = {
              name,
              version,
              commitHash,
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
  ssr: process.env.NODE_ENV === 'production',
})
