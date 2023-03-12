import type { WebSocketStatus } from '@vueuse/core'

export interface UseWSRTCOptions {
  roomId: Ref<string>
  role: 'sender' | 'receiver'
  roomUserIds: Ref<number[]>
  senderId: Ref<number>
  wsStatus: Ref<WebSocketStatus>
  rtcStatus: Ref<RTCPeerConnectionState>
  dataChannelStatus: Ref<RTCDataChannelState>
}

export interface RTCDataChannelFileData {
  totalLength?: number
  // 标记传输一个文件
  transimitId: number
  sequence: number
  hasMore: 0 | 1
  payload: ArrayBuffer
}

function buildRTCDataChannelFileData(data: RTCDataChannelFileData): ArrayBuffer {
  const { transimitId, sequence, hasMore, payload } = data

  const totalLength = 12 + payload.byteLength

  const header = new ArrayBuffer(12)
  const headerView = new DataView(header)
  headerView.setUint32(0, totalLength)
  headerView.setUint32(2, transimitId)
  headerView.setUint32(4, sequence)
  headerView.setUint8(8, hasMore)

  const buffer = new ArrayBuffer(totalLength)
  const view = new Uint8Array(buffer)
  view.set(new Uint8Array(header), 0)
  view.set(new Uint8Array(payload), 12)

  return buffer
}

function parseRTCDataChannelFileData(data: ArrayBuffer): RTCDataChannelFileData {
  const view = new DataView(data)
  const totalLength = view.getUint32(0)
  const transimitId = view.getUint32(2)
  const sequence = view.getUint32(4)
  const hasMore = view.getUint8(8) as (0 | 1)
  const payload = new Uint8Array(data.slice(12, totalLength))

  return {
    totalLength,
    transimitId,
    sequence,
    hasMore,
    payload,
  }
}

export async function useWsRTC(options: UseWSRTCOptions) {
  const { wsStatus, rtcStatus, dataChannelStatus, roomId, role, roomUserIds, senderId } = options

  let rtcConn: RTCPeerConnection
  let dataChannel: RTCDataChannel

  if (role === 'sender') {
    console.log('generate room id')
    roomId.value = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
  }

  const { status: WsStatus, data, send: sendWs, open: openWebsocket } = useWebSocket('ws://localhost:1323/ws', {
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

        if (users.length > 1) {
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

  function sendFileWithRTC(file: File) {
    if (dataChannelStatus.value !== 'open') {
      console.log('data channel not open')
      return
    }

    file.arrayBuffer()
      .then((buffer) => {
        // slice file
        const sliceSize = 16 * 1024 // 16KB

        let byteSent = 0
        let sequence = 0
        while (byteSent < buffer.byteLength) {
          const slice = buffer.slice(byteSent, byteSent + sliceSize)

          dataChannel.send(buildRTCDataChannelFileData({
            sequence,
            transimitId: 1,
            totalLength: buffer.byteLength,
            payload: slice,
            hasMore: byteSent + sliceSize < buffer.byteLength ? 1 : 0,
          }))

          sequence++
          byteSent += sliceSize
        }
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
