<script setup lang="ts">
import buildInfo from 'virtual:build-info'
import wallpapers from 'virtual:wallpaper-auto-scanner'

useHead({
  title: 'Computer Applet',
})

const favicons = {
  node: 'https://nodejs.org/static/images/favicons/apple-touch-icon.png',
  typescript: 'https://www.typescriptlang.org/icons/icon-256x256.png',
  vue: 'https://vuejs.org/logo.svg',
  nuxt: 'https://nuxt.com/icon.png',
  pinia: 'https://pinia.vuejs.org/logo.svg',
  vueuse: 'https://vueuse.org/favicon.svg',
  unocss: 'https://cdn.jsdelivr.net/gh/unocss/unocss/playground/public/icon.svg',
  vite: 'https://cn.vitejs.dev/logo.svg',
  sass: 'https://sass-lang.com/assets/img/logos/logo-b6e1ef6e.svg',
  eslint: 'https://eslint.org/apple-touch-icon.png',
}
</script>

<template>
  <div w-full h-40vh flex-center relative>
    <img
      absolute z--1
      w-full h-full object-cover
      :src="wallpapers[Math.ceil(Math.random() * wallpapers.length) - 1]"
    >

    <h1 text-2xl text-white text-shadow-xl>
      Virtual Web Desktop
    </h1>
  </div>

  <div mt--3vh w-90vw mx-auto gap-xl flex flex-row flex-wrap justify-evenly pb-xl>
    <div
      inline-block bg-white rounded-xl p-xl shadow-xl flex-1
      min-w-full lg:min-w-120
    >
      <table w-full>
        <tbody>
          <tr>
            <td>名称</td>
            <td>{{ buildInfo.name }}</td>
          </tr>
          <tr>
            <td>版本</td>
            <td>{{ buildInfo.version }}</td>
          </tr>
          <tr>
            <td>Commit Hash</td>
            <td>{{ buildInfo.commitHash }}</td>
          </tr>
          <tr>
            <td>开发者</td>
            <td>{{ buildInfo.author }}</td>
          </tr>
          <tr>
            <td>构建时间</td>
            <td>
              <ClientOnly>
                {{ new Date(buildInfo.buildDate).toLocaleDateString() }}
                {{ new Date(buildInfo.buildDate).toLocaleTimeString() }}
              </ClientOnly>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      inline-block bg-white rounded-xl p-xl shadow-xl flex-1
      min-w-full lg:min-w-120
    >
      <div w-full text-center pb-sm>
        <span>基于</span>
      </div>

      <div frow gap-sm flex-wrap>
        <div v-for="name in Object.keys(favicons)" :key="name" flex-1 text-center>
          <div flex-center w-3em h-3em p-0.5rem rounded-xl mx-auto border border-solid border-black:10 hover="bg-#000/5" transition>
            <img :src="favicons[name]" :alt="name" w-full h-full>
          </div>
        </div>
      </div>

      <div w-full text-center pt-sm>
        <span>等构建</span>
      </div>
    </div>

    <div
      v-for="x in 0" :key="x" inline-block bg-white rounded-xl p-xl shadow-xl flex-1
      min-w="75%" lg:min-w-120 text-justify
    >
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
      这里是其他内容
    </div>
  </div>
</template>

<style lang="scss" scoped>
tr{
  @apply text-justify;

  td{
    &:first-child{
      text-align: left;
    }

    &:last-child{
      text-align: right;
    }
  }
}
</style>
