import type { WebSocketStatus } from '@vueuse/core'
import { SliceFile } from '../utils/file'

export interface UseWSRTCOptions {
  role: 'file-sender' | 'file-receiver' | 'screen-viewer'
  autoGenerateRoomId?: boolean
  onFileReceived?: (file: SliceFile) => void
}

export function useWsRTC(options: UseWSRTCOptions) {
  const roomId = ref('')
  const wsStatus = ref<WebSocketStatus>('CLOSED')
  const rtcStatus = ref<RTCPeerConnectionState>('closed')
  const dataChannelStatus = ref<RTCDataChannelState>('closed')
  const roomUserIds = ref<number[]>([])
  const senderId = ref(0)

  const { role, autoGenerateRoomId = false } = options

  const fileMap = new Map<number, {
    file: SliceFile
    // 不同文件需要有不同的回调函数，不然可能会应为节流而没有被调用，忽略掉小文件
    onReceived?: (file: SliceFile) => void
  }>()

  let rtcConn: RTCPeerConnection
  let dataChannel: RTCDataChannel

  if (autoGenerateRoomId) {
    console.log('generate room id')
    roomId.value = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
  }

  const { status: WsStatus, data, send: sendWs, open: openWebsocket } = useWebSocket(import.meta.env.VITE_WS_URL, {
    immediate: false,
    autoClose: true,
    autoReconnect: true,
    heartbeat: false,
  })

  const stopWatchWsStatus = watch(WsStatus, (newStatus, oldStatus) => {
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

  const stopWatchRTCStatus = watch(rtcStatus, (newStatus, oldStatus) => {
    console.log('rtc status', oldStatus, newStatus)
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

        switch (d.payloadType) {
          case WsPayloadType.WebRTC: {
            if (!rtcConn
              || rtcConn.connectionState === 'disconnected'
              || rtcConn.connectionState === 'failed') { // 接收者被动启动 WebRTC
              startWebRTC()
            }

            processWsWebRTCData(d.payload as ArrayBuffer)
            break
          }
        }

        break
      }
    }
  }

  async function processWsWebRTCData(data: ArrayBuffer) {
    const { action, userId, payload } = decodeWsRTCData(data)

    switch (action) {
      case WsRTCAction.Offer: {
        const offer = JSON.parse(new TextDecoder().decode(payload))
        console.log('receive offer from', userId, payload, offer)
        await rtcConn.setRemoteDescription(offer)
        const answer = await rtcConn.createAnswer()
        await rtcConn.setLocalDescription(answer)
        console.log('send answer', answer)
        sendWs(buildWsData({
          action: WsAction.ApplicationMessage,
          payloadType: WsPayloadType.WebRTC,
          room: parseInt(roomId.value),
          sender: senderId.value,
          payload: encodeWsRTCData({
            action: WsRTCAction.Answer,
            userId: senderId.value,
            payload: new TextEncoder().encode(JSON.stringify(answer)),
          }),
        }))
        break
      }
      case WsRTCAction.Answer: {
        const answer = JSON.parse(new TextDecoder().decode(payload))
        console.log('receive answer from', userId, payload, answer)
        await rtcConn.setRemoteDescription(answer)
        break
      }
      case WsRTCAction.IceCandidate: {
        const iceCandidate = JSON.parse(new TextDecoder().decode(payload))
        console.log('receive ice candidate from', userId, payload, iceCandidate)
        await rtcConn.addIceCandidate(iceCandidate)
        break
      }
    }
  }

  function startWebRTC() {
    rtcConn = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:server.npmdev.com',
        },
      ],
    })

    rtcConn.onicecandidate = (e) => {
      console.log('onicecandidate', e)
      e.candidate && sendWs(buildWsData({
        action: WsAction.ApplicationMessage,
        payloadType: WsPayloadType.WebRTC,
        room: parseInt(roomId.value),
        sender: senderId.value,
        payload: encodeWsRTCData({
          action: WsRTCAction.IceCandidate,
          userId: senderId.value,
          payload: new TextEncoder().encode(JSON.stringify(e.candidate)),
        }),
      }))
    }

    rtcConn.oniceconnectionstatechange = (e) => {
      console.log('oniceconnectionstatechange', e)
    }

    rtcConn.onicegatheringstatechange = (e) => {
      console.log('onicegatheringstatechange', e)
    }

    rtcConn.onnegotiationneeded = (e) => {
      console.log('onnegotiationneeded', e)
    }

    rtcConn.onconnectionstatechange = (e) => {
      console.log('onconnectionstatechange', e)
      rtcStatus.value = rtcConn.connectionState
    }

    rtcConn.ondatachannel = (e) => {
      console.log('ondatachannel', e)

      dataChannel = e.channel
      dataChannel.onopen = onDataChannelOpen
      dataChannel.onclose = onDataChannelClose
      dataChannel.onclosing = onDataChannelClosing
      dataChannel.onmessage = onDataChannelMessage
      dataChannel.onerror = onDataChannelError
    }

    if (role === 'file-sender') {
      console.log('sender create data channel')

      dataChannel = rtcConn.createDataChannel('file')
      dataChannel.binaryType = 'arraybuffer'
      dataChannel.onopen = onDataChannelOpen
      dataChannel.onclose = onDataChannelClose
      dataChannel.onmessage = onDataChannelMessage
      dataChannel.onerror = onDataChannelError
      dataChannel.onclosing = onDataChannelClosing

      rtcConn.createOffer().then((offer) => {
        console.log('sender create offer', offer)
        rtcConn.setLocalDescription(offer)
        sendWs(buildWsData({
          action: WsAction.ApplicationMessage,
          payloadType: WsPayloadType.WebRTC,
          room: parseInt(roomId.value),
          sender: senderId.value,
          payload: encodeWsRTCData({
            action: WsRTCAction.Offer,
            userId: senderId.value,
            payload: new TextEncoder().encode(JSON.stringify(offer)),
          }),
        }))
      })
    }
  }

  function onDataChannelOpen(e: Event) {
    console.log('data channel open', e)
    dataChannelStatus.value = 'open'
  }

  function onDataChannelMessage(e: MessageEvent) {
    console.log('data channel message', e)
    const arr = new Uint8Array(e.data)

    const data = decodeRTCDataChannelData(arr.buffer)

    switch (data.type) {
      case RTCDataChannelDataType.Message: {
        break
      }
      case RTCDataChannelDataType.FileSlice: {
        const fileData = decodeRTCDataChannelFileSlice(data.payload)
        console.log('data channel file slice', fileData)

        let fileWithHook = fileMap.get(fileData.fileId)

        if (!fileWithHook) {
          const file = new SliceFile(fileData.sliceSize, fileData.fileSize, fileData.fileName)
          fileWithHook = {
            file,
            onReceived: options.onFileReceived !== undefined
              ? useThrottleFn(options.onFileReceived, 100)
              : undefined,
          }
          fileMap.set(fileData.fileId, fileWithHook)
        }

        fileWithHook.file.push(fileData.sequence, fileData.payload)

        fileWithHook.onReceived && fileWithHook.onReceived(fileWithHook.file)

        // 最后一个一定要报告一下
        if (!fileData.hasMore) {
          options.onFileReceived && options.onFileReceived(fileWithHook.file)
        }
        break
      }
    }
  }

  function onDataChannelClose(e: Event) {
    console.log('data channel close', e)
    dataChannelStatus.value = 'closed'
  }

  function onDataChannelError(e: Event) {
    console.log('data channel error', e)
  }

  function onDataChannelClosing(e: Event) {
    console.log('data channel closing', e)
    dataChannelStatus.value = 'closing'
  }

  function sendFileWithRTC(file: File, onPercentage?: (name: string, percentage: number) => void) {
    if (dataChannelStatus.value !== 'open') {
      console.log('data channel not open')
      return
    }

    SliceFile.fromFile(file).then((sliceFile) => {
      const fileId = Math.ceil(Math.random() * 1000000)

      let sliceSent = 0

      const send = () => {
        while (sliceSent < sliceFile.sliceCount) {
          if (dataChannel.bufferedAmount > dataChannel.bufferedAmountLowThreshold) {
            dataChannel.onbufferedamountlow = () => {
              dataChannel.onbufferedamountlow = null
              send()
            }
            return
          }

          const filePayload = encodeRTCDataChannelFileSlice({
            fileId,
            hasMore: sliceSent < sliceFile.sliceCount - 1 ? 1 : 0,
            sliceSize: sliceFile.sliceSize,
            fileSize: sliceFile.fileSize,
            sequence: sliceSent,
            fileName: file.name,
            payload: sliceFile.at(sliceSent),
          })

          dataChannel.send(encodeRTCDataChannelData({
            type: RTCDataChannelDataType.FileSlice,
            payload: filePayload,
          }))

          sliceSent++

          onPercentage && onPercentage(file.name, (sliceSent / sliceFile.sliceCount * 100))
        }
      }

      send()
    })
  }

  onUnmounted(() => {
    stopWatchData()
    stopWatchWsStatus()
    stopWatchRTCStatus()
  })

  return {
    data,
    roomId,
    roomUserIds,
    senderId,
    wsStatus,
    rtcStatus,
    dataChannelStatus,
    sendWs,
    openWebsocket,
    startWebRTC,
    sendFileWithRTC,
  }
}
