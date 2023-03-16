import type { WsPayloadType } from './../utils/websocket'

export interface UseWsOptions {
  autoGenerateRoomId?: boolean
  messageHandler?: (sender: number, type: WsPayloadType, data: ArrayBuffer) => void
}

export type SendAppMessageFn = (payloadType: WsPayloadType, payload: ArrayBuffer) => void

export function useWs(options?: UseWsOptions) {
  const roomId = ref('')
  const roomUserIds = ref<number[]>([])
  const senderId = ref(0)

  const { autoGenerateRoomId = false, messageHandler } = options || {}

  if (autoGenerateRoomId) {
    console.log('generate room id')
    roomId.value = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
  }

  const { status: wsStatus, data, send: sendWs, open: openWebsocket } = useWebSocket(import.meta.env.VITE_WS_URL, {
    immediate: false,
    autoClose: true,
    autoReconnect: true,
    heartbeat: false,
  })

  const stopWatchWsStatus = watch(wsStatus, (newStatus, oldStatus) => {
    console.log('ws status', oldStatus, newStatus)

    switch (newStatus) {
      case 'OPEN': {
        roomUserIds.value = []
        break
      }
      case 'CLOSED': {
        roomUserIds.value = []
        break
      }
    }

    wsStatus.value = newStatus
  })

  const stopWatchData = watch(data, (val) => {
    if (val instanceof ArrayBuffer || val instanceof Blob) {
      console.log('receive binary data', val)
      processWsData(val)
    }
    else {
      console.log('receive text data', val)
    }
  })

  async function processWsData(data: ArrayBuffer | Blob) {
    const d = await decodeWsData(data)
    switch (d.action) {
      case WsAction.NotifyClientInfo: {
        console.log('setup client')
        senderId.value = d.sender

        // 加入房间
        sendWs(buildWsData({
          action: WsAction.JoinRoom,
          room: parseInt(roomId.value),
          sender: senderId.value,
        }))
        break
      }
      case WsAction.AnnounceRoomUserIds: {
        console.log('setup room', d.room, d.payload)
        const { users } = decodeRoomInfo(d.payload as ArrayBuffer)
        roomUserIds.value = users
        break
      }
      case WsAction.ApplicationMessage: {
        console.log(senderId.value, 'receive custom message from', d.sender, d.payload)

        // 发送者是自己的话，不处理
        if (d.sender === senderId.value)
          break

        messageHandler && messageHandler(d.sender, d.payloadType as WsPayloadType, d.payload as ArrayBuffer)

        break
      }
    }
  }

  function sendAppMsg(payloadType: WsPayloadType, payload: ArrayBuffer) {
    sendWs(buildWsData({
      action: WsAction.ApplicationMessage,
      payloadType,
      room: parseInt(roomId.value),
      sender: senderId.value,
      payload,
    }))
  }

  onUnmounted(() => {
    stopWatchData()
    stopWatchWsStatus()
  })

  return {
    data,
    roomId,
    roomUserIds,
    senderId,
    wsStatus,
    sendWs,
    sendAppMsg,
    openWebsocket,
  }
}
