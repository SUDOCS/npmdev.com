<script setup lang="ts">
import { FileReceiver, FileSender } from '@/utils/webrtc'
let fileSender: FileSender | null = null
let fileReceiver: FileReceiver | null = null

let globalOffer: RTCSessionDescriptionInit | null = null
const globalAnswer: RTCSessionDescriptionInit | null = null

async function setupSender() {
  fileSender = new FileSender()
  const offer = await fileSender.createOffer()
  console.log(offer)
  // sending offer to receiver
  globalOffer = offer
  // waiting for receiver's answer
  if (globalAnswer) {
    fileSender.setOfferOrAnswer(globalAnswer)
  }
}

async function setupReceiver() {
  fileReceiver = new FileReceiver()

  // waiting for sender's offer
  const offer = globalOffer
  if (offer) {
    fileReceiver.setOfferOrAnswer(offer)
  }
  else {
    return
  }
  // sending answer to sender
  const answer = await fileReceiver.createAnswer()
  console.log(offer)
}

onMounted(() => {
//   setupWebrtc()
})
</script>

<template>
  <button @click="setupSender">
    setup sender
  </button>

  <button @click="setupReceiver">
    setup receiver
  </button>
</template>

<style lang="scss" scoped>
</style>
