import fs from 'node:fs'
import path from 'node:path'
import { execa } from 'execa'
import fg from 'fast-glob'
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
  routeRules: {
    '/file-transfer/*': { ssr: false }, /* 一个*，不包括index，但包含 sender 和 receiver */
    '/live': { ssr: false },
    '/music': { ssr: false },
    '/reader': { ssr: false },
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
            const files = fg.sync(['public/wallpapers/*.webp'], { onlyFiles: true })
            const wallpapers = files.map(file => file.replace('public/', '/'))
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
    server: {
      proxy: {
        '/youdao': {
          target: 'http://fanyi.youdao.com',
          rewrite(path) {
            return path.replace(/^\/youdao/, '/translate')
          },
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
  css: [
    '@/assets/common.scss',
  ],
  ssr: true,
})
