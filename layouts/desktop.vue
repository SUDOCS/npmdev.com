<script setup lang="ts">
import { desktopApps } from '@/applets'

const appletStore = useAppletStore()
const { mountedApps } = storeToRefs(appletStore)

const apps = computed(() => {
  return desktopApps.filter((app) => {
    return mountedApps.value.includes(app.name)
  })
})

// https://images.unsplash.com/photo-1509565840034-3c385bbe6451?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&q=50

const wallpapers = [
  '/wallpapers/06aa4c34ba5727eeb9fc627361b1820ce785e061de89a8100e2c369e7390339d.jpg',
  '/wallpapers/19e4e01babd066416f0e0e0581718f171fbf66e8eab5851bce54293e996cab0f.jpg',
  '/wallpapers/1b13991786eaaac28e118871a0d097ca77fcc8a020aa2681d60a65dd35845f97.jpg',
  '/wallpapers/2c59b66b591a8d5cffa41ac1962dc39fa9ef8009b1ac59b5240114b863a6e7fe.jpg',
  '/wallpapers/392332dd15e8606652adca1e118961e628ba4ada3f068ba48cb4588cdef199bc.jpg',
  '/wallpapers/470524c0f804b6d13309ba1f06a205958dae5fd47baea6d27ca6ba2bb4aa1a65.jpg',
  '/wallpapers/9208ef0f3e6590dbafa0739009a6bb06e15a64e46424e796d74fabc29f57daf3.jpg',
  '/wallpapers/b5669f0b444ec166399c110391ea7a7986c253998a9128d7cd76155ec99357c9.jpg',
  '/wallpapers/bfe3f2cc5af4e5eeb3bb6e426b81c4fab4b1ae9505368661219415758663e9f5.jpg',
  '/wallpapers/ebb7f03739d2f3aeb69f6600a1aeaaace012fb06d464e3b08048e2e46208a42a.jpg',
  '/wallpapers/f99573e434b9e49a30a16efcfaeb313aa1f78796163859fa8af60ed30f8bf0da.jpg',
  '/wallpapers/photo-1509565840034-3c385bbe6451.jpg',
]
</script>

<template>
  <div w-100vw h-100vh relative overflow-hidden>
    <DesktopGrid />
    <DesktopDock />

    <ClientOnly>
      <DesktopWindow v-for="app in apps" :key="app.name" :config="app" />
    </ClientOnly>

    <div fixed top-0 bottom-0 right-0 left-0 z--1>
      <img
        w-full h-full object-cover class="animate-[bganim_60s_linear_infinite] lg:animate-none"
        :src="wallpapers[Math.ceil(Math.random() * wallpapers.length) - 1]"
      >
    </div>
  </div>
</template>

<style lang="scss">
@keyframes bganim {
  0% {
    object-position: left top;
  }

  100%{
    object-position: right bottom;
  }
}
</style>
