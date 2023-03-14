import type { WebSocketStatus } from '@vueuse/core'
import { SliceFile } from '../utils/file'

export interface UseWSRTCOptions {
  roomId: Ref<string>
  role: 'sender' | 'receiver'
  roomUserIds: Ref<number[]>
  senderId: Ref<number>
  wsStatus: Ref<WebSocketStatus>
  rtcStatus: Ref<RTCPeerConnectionState>
  dataChannelStatus: Ref<RTCDataChannelState>
  onFileReceived?: (file: SliceFile) => void
}

export enum RTCDataChannelDataType {
  Message = 1,
  FileSlice,
}

export interface RTCDataChannelData {
  totalLength?: number // 2 bytes
  type: RTCDataChannelDataType // 2 byte
  payload: ArrayBuffer
}

function encodeRTCDataChannelData(data: RTCDataChannelData): ArrayBuffer {
  const { type, payload } = data

  const totalLength = 4 + payload.byteLength

  const buffer = new ArrayBuffer(totalLength)
  const view = new DataView(buffer)

  view.setUint16(0, totalLength)
  view.setUint16(2, type)

  const payloadView = new Uint8Array(buffer, 4)
  payloadView.set(new Uint8Array(payload))

  return buffer
}

function decodeRTCDataChannelData(data: ArrayBuffer): RTCDataChannelData {
  const view = new DataView(data)

  const totalLength = view.getUint16(0)
  const type = view.getUint16(2) as RTCDataChannelDataType

  const payload = data.slice(4)

  return {
    totalLength,
    type,
    payload,
  }
}

export interface RTCDataChannelFileSlice {
  totalLength?: number // 2 bytes
  // 标记传输一个文件
  fileId: number // 1 bytes
  hasMore: 0 | 1 // 1 byte

  sliceSize: number // 4 bytes
  fileSize: number // 4 bytes
  sequence: number // 4 bytes

  // offset: 16
  fileNameLength?: number // 2 bytes
  // offset: 18
  fileName: string // 254 bytes

  // offset: 272
  payload: ArrayBuffer
}

function encodeRTCDataChannelFileSlice(data: RTCDataChannelFileSlice): ArrayBuffer {
  const { fileId, sliceSize, fileSize, fileName, sequence, hasMore, payload } = data

  const totalLength = 16 + 256 + payload.byteLength
  const nameBuffer = new TextEncoder().encode(fileName)
  const fileNameLength = nameBuffer.byteLength

  const buffer = new ArrayBuffer(totalLength)
  const view = new DataView(buffer)

  view.setUint16(0, totalLength)
  view.setUint8(2, fileId)
  view.setUint8(3, hasMore)
  view.setUint32(4, sliceSize)
  view.setUint32(8, fileSize)
  view.setUint32(12, sequence)
  view.setUint16(16, fileNameLength)

  const nameView = new Uint8Array(buffer, 18, 254)
  nameView.set(nameBuffer)

  const payloadView = new Uint8Array(buffer, 272)
  payloadView.set(new Uint8Array(payload))

  return buffer
}

function decodeRTCDataChannelFileSlice(data: ArrayBuffer): RTCDataChannelFileSlice {
  const view = new DataView(data)

  const totalLength = view.getUint16(0)
  const fileId = view.getUint8(2)
  const hasMore = view.getUint8(3) as 0 | 1
  const sliceSize = view.getUint32(4)
  const fileSize = view.getUint32(8)
  const sequence = view.getUint32(12)
  const fileNameLength = view.getUint16(16)

  const fileName = new TextDecoder().decode(data.slice(18, 18 + fileNameLength))

  const payload = data.slice(272)

  return {
    totalLength,
    fileId,
    hasMore,
    sliceSize,
    fileSize,
    sequence,
    fileNameLength,
    fileName,
    payload,
  }
}

export async function useWsRTC(options: UseWSRTCOptions) {
  const { wsStatus, rtcStatus, dataChannelStatus, roomId, role, roomUserIds, senderId } = options

  const fileMap = new Map<number, {
    file: SliceFile
    // 不同文件需要有不同的回调函数，不然可能会应为节流而没有被调用，忽略掉小文件s
    onReceived?: (file: SliceFile) => void
  }>()

  let rtcConn: RTCPeerConnection
  let dataChannel: RTCDataChannel

  if (role === 'sender') {
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
    const d = await parseWsData(data)
    switch (d.action) {
      case WsAction.SendClientInfo: {
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
      case WsAction.SendRoomUserIds:{
        console.log('setup room', d.room, d.payload)
        const { users } = parseRoomInfo(d.payload as ArrayBuffer)
        roomUserIds.value = users

        if (users.length === 2) {
          startRtc()
        }
        break
      }
      case WsAction.CustomMessage:{
        console.log(senderId.value, 'receive custom message from', d.sender, d.payload)
        const { action, userId, payload } = parseWsRTCData(d.payload as ArrayBuffer)

        // 发送者是自己的话，不处理
        if (d.sender === senderId.value)
          break

        switch (action) {
          case WsRTCAction.Offer:{
            const offer = JSON.parse(new TextDecoder().decode(payload))
            console.log('receive offer from', userId, payload, offer)
            await rtcConn.setRemoteDescription(offer)
            const answer = await rtcConn.createAnswer()
            await rtcConn.setLocalDescription(answer)
            console.log('send answer', answer)
            sendWs(buildWsData({
              action: WsAction.CustomMessage,
              room: parseInt(roomId.value),
              sender: senderId.value,
              payload: buildWsRTCData({
                action: WsRTCAction.Answer,
                userId: senderId.value,
                payload: new TextEncoder().encode(JSON.stringify(answer)),
              }),
            }))
            break
          }
          case WsRTCAction.Answer:{
            const answer = JSON.parse(new TextDecoder().decode(payload))
            console.log('receive answer from', userId, payload, answer)
            await rtcConn.setRemoteDescription(answer)
            break
          }
          case WsRTCAction.IceCandidate:{
            const iceCandidate = JSON.parse(new TextDecoder().decode(payload))
            console.log('receive ice candidate from', userId, payload, iceCandidate)
            await rtcConn.addIceCandidate(iceCandidate)
            break
          }
        }
        break
      }
    }
  }

  function startRtc() {
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
        action: WsAction.CustomMessage,
        room: parseInt(roomId.value),
        sender: senderId.value,
        payload: buildWsRTCData({
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

    if (role === 'sender') {
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
          action: WsAction.CustomMessage,
          room: parseInt(roomId.value),
          sender: senderId.value,
          payload: buildWsRTCData({
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
      case RTCDataChannelDataType.Message:{
        break
      }
      case RTCDataChannelDataType.FileSlice:{
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
  })

  return {
    data,
    roomId,
    roomUserIds,
    senderId,
    sendWs,
    openWebsocket,
    sendFileWithRTC,
  }
}
