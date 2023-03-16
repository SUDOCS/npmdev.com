import { WsPayloadType } from '~~/utils/websocket'

export interface UseWsRTCLiveOptions {
  videoEle: Ref<HTMLVideoElement | undefined>
}

export function useWsRTCLive(options: UseWsRTCLiveOptions) {
  const { videoEle } = options
  const { roomId, senderId, roomUserIds, wsStatus, openWebsocket, sendAppMsg } = useWs({
    autoGenerateRoomId: false,
    messageHandler: handleLiveAndChatMessage,
  })

  const chatMessages = shallowRef<{ sender: number; msg: string }[]>([])
  const streamName = computed(() => `${roomId.value}-${senderId.value}`)

  const { publish, unpublish, pushing, stream: pushStrem } = useRTCPublisher()

  const { play, stop, pulling, stream: pullStream } = useRTCPlayer()

  watch(pushStrem, (stream) => {
    if (stream && videoEle.value) {
      videoEle.value.srcObject = stream
    }
  })

  watch(pullStream, (stream) => {
    if (stream && videoEle.value) {
      videoEle.value.srcObject = stream
    }
  })

  async function togglePublish() {
    if (pulling.value) {
      return
    }

    if (pushing.value) {
      await unpublish()
    }
    else {
      await publish(streamName.value)

      sendAppMsg(WsPayloadType.Live, encodeWsLiveData({
        action: WsLiveAction.Publish,
        userId: senderId.value,
        payload: encodeLiveInfo({
          liveName: streamName.value,
        }),
      }))
    }
  }

  function handleLiveAndChatMessage(sender: number, type: WsPayloadType, data: ArrayBuffer) {
    if (type === WsPayloadType.Live) {
      console.log('receive live message', sender, data)
      const liveData = decodeWsLiveData(data)

      switch (liveData.action) {
        case WsLiveAction.Publish: {
          const info = decodeLiveInfo(liveData.payload)
          play(info.liveName)
          break
        }
        case WsLiveAction.Message: {
          break
        }
      }
    }
    else if (type === WsPayloadType.Chat) {
      console.log('receive chat message', sender, data)
      const chatData = decodeChatMessage(data)
      switch (chatData.type) {
        case ChatMessageType.Text: {
          const text = decodeTextMessage(chatData.payload)
          console.log('receive text message', text)
          chatMessages.value = chatMessages.value.concat([{ sender, msg: text.text }])
          break
        }
      }
    }
  }

  function sendChatMessage(message: string) {
    sendAppMsg(WsPayloadType.Chat, encodeChatMessage({
      type: ChatMessageType.Text,
      payload: encodeTextMessage({
        text: message,
      }),
    }))

    chatMessages.value = chatMessages.value.concat([{ sender: senderId.value, msg: message }])
  }

  onUnmounted(() => {
    if (videoEle.value) {
      videoEle.value.srcObject = null
    }
    stop()
    unpublish()
  })

  return {
    roomId,
    senderId,
    roomUserIds,
    wsStatus,
    pushing,
    pulling,
    openWebsocket,
    togglePublish,
    sendChatMessage,
    chatMessages,
  }
}
