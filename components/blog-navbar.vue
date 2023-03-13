<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
  shadow: {
    type: Boolean,
    default: false,
  },
})

const { show, shadow } = toRefs(props)
// show.value = true
</script>

<template>
  <nav
    class="blog-navbar blog-navbar-expand"
    :class="{ 'blog-navbar-hidden': !show, 'blog-navbar-shadow': shadow }"
  >
    <div class="navbar-detail">
      <ul class="nav-list">
        <li class="nav-item">
          <nuxt-link to="/blog" class="navbar-brand">
            🏠首页
          </nuxt-link>
        </li>
        <li class="nav-item">
          <router-link to="/">
            🖥️桌面
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/blog/achieve">
            📂归档
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/blog/categories">
            📓分类
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/blog/about">
            👒关于
          </router-link>
        </li>
      </ul>
      <ul class="nav-list">
        <li class="nav-item">
          <Icon name="fluent:weather-moon-24-regular" w-6 h-6 />
        </li>
      </ul>
    </div>
    <div class="navbar-brief">
      <ul class="nav-list">
        <li class="nav-item">
          <Icon name="fluent:apps-24-regular" w-6 h-6 />
        </li>
      </ul>
      <ul class="nav-list">
        <li class="nav-item">
          <Icon name="fluent:weather-moon-24-regular" w-6 h-6 />
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped lang="scss">
$height: 48px;

@keyframes blog-navbar-in {
    0% {
        top: -$height;
    }
    100% {
        top: 30px;
    }
}

.blog-navbar {
    @apply fixed top-30px left-0 right-0 m-auto frow justify-between
    h-48px transition-all duration-500ms
    transition-ease-out text-1rem py-12px rounded-1/2 shadow-none
    animate-[blog-navbar-in_ease-out_0.5s] text-white
    text-shadow-[0_0_3px_#1C1F21]
    w-80% md:w-720px lg:w-960px xl:w-1200px;

    &::before {
        @apply absolute-full content-none z--1 rounded-48px
        backdrop-blur-4px bg-#c2e9fb66;
    }

    &-hidden {
        top: -$height;
    }

    &-shadow {
        .navbar-content {
            box-shadow: 0 0 10px rgb(0, 0, 0, 0.07) !important;
        }
    }

    .navbar-detail,
    .navbar-brief {
        @apply w-full h-full frow justify-between;
    }

    .navbar-detail{
        @apply hidden md:flex;
    }

    .navbar-brief{
        @apply flex md:hidden;
    }

    .nav-list {
        @apply h-full flex-center font-bold;

        .nav-item {
            @apply inline px-12px cursor-pointer;
        }
    }
}
</style>
