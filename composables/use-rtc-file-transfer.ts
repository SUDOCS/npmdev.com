import { SliceFile } from '../utils/file'
import type { SendAppMessageFn } from './use-ws'

export interface UseRTCFileTransferOptions {
  role: 'sender' | 'receiver'
  onFileReceived?: (file: SliceFile) => void
  sendAppMessage?: SendAppMessageFn
}

export function useRTCFileTransfer(options: UseRTCFileTransferOptions) {
  const rtcStatus = ref<RTCPeerConnectionState | 'notcreated' | 'created'>('notcreated')
  const dataChannelStatus = ref<RTCDataChannelState>('closed')

  const { role, onFileReceived, sendAppMessage } = options

  const fileMap = new Map<number, {
    file: SliceFile
    // 不同文件需要有不同的回调函数，不然可能会应为节流而没有被调用，忽略掉小文件
    onReceived?: (file: SliceFile) => void
  }>()

  let rtcConn: RTCPeerConnection
  let dataChannel: RTCDataChannel

  const stopWatchRTCStatus = watch(rtcStatus, (newStatus, oldStatus) => {
    console.log('rtc status', oldStatus, newStatus)
  })

  function sendSignaling(data: ArrayBuffer) {
    sendAppMessage && sendAppMessage(WsPayloadType.WebRTC, data)
  }

  async function processRTCSignalingData(sender: number, data: ArrayBuffer) {
    console.log('receive rtc signaling data from', sender, data)

    const { action, userId, payload } = decodeWsRTCData(data)

    switch (action) {
      case WsRTCAction.Offer: {
        const offer = JSON.parse(new TextDecoder().decode(payload))
        console.log('receive offer from', userId, payload, offer)
        await rtcConn.setRemoteDescription(offer)
        const answer = await rtcConn.createAnswer()
        await rtcConn.setLocalDescription(answer)
        console.log('send answer', answer)

        sendSignaling(encodeWsRTCData({
          action: WsRTCAction.Answer,
          userId: sender,
          payload: new TextEncoder().encode(JSON.stringify(answer)),
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
    rtcStatus.value = 'created'

    rtcConn = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'turn:server.npmdev.com',
          username: 'npmdev',
          credential: 'npmdev.com',
        },
      ],
    })

    rtcConn.onicecandidate = (e) => {
      console.log('onicecandidate', e)
      e.candidate && sendSignaling(encodeWsRTCData({
        action: WsRTCAction.IceCandidate,
        userId: 0,
        payload: new TextEncoder().encode(JSON.stringify(e.candidate)),
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

        sendSignaling(encodeWsRTCData({
          action: WsRTCAction.Offer,
          userId: 0,
          payload: new TextEncoder().encode(JSON.stringify(offer)),
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
            onReceived: onFileReceived !== undefined
              ? useThrottleFn(onFileReceived, 100)
              : undefined,
          }
          fileMap.set(fileData.fileId, fileWithHook)
        }

        fileWithHook.file.push(fileData.sequence, fileData.payload)

        fileWithHook.onReceived && fileWithHook.onReceived(fileWithHook.file)

        // 最后一个一定要报告一下
        if (!fileData.hasMore) {
          onFileReceived && onFileReceived(fileWithHook.file)
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
    stopWatchRTCStatus()
  })

  return {
    rtcStatus,
    dataChannelStatus,
    processRTCSignalingData,
    startWebRTC,
    sendFileWithRTC,
  }
}
