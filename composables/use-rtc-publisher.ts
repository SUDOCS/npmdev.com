export function useRTCPublisher() {
  const stream = shallowRef<MediaStream>()
  const rtcStatus = ref<RTCPeerConnectionState>('closed')

  const pushing = ref(false)

  let rtcConn: RTCPeerConnection
  let currentStreamId: string

  async function publish(streamId: string) {
    rtcConn = new RTCPeerConnection()
    currentStreamId = streamId

    rtcConn.addTransceiver('video', { direction: 'sendonly' })
    rtcConn.addTransceiver('audio', { direction: 'sendonly' })

    rtcConn.onconnectionstatechange = () => {
      rtcStatus.value = rtcConn.connectionState

      if (rtcStatus.value === 'connected') {
        pushing.value = true
      }
      else if (rtcStatus.value === 'disconnected') {
        pushing.value = false
      }
    }

    const s = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    })

    s.getTracks().forEach((track) => {
      rtcConn.addTrack(track, s)
    })

    // 当屏幕共享结束时，停止推流
    s.getTracks()[0].onended = () => {
      unpublish()
    }

    const offer = await rtcConn.createOffer()
    await rtcConn.setLocalDescription(offer)

    const { data } = await useFetch(`//live.npmdev.com/index/api/webrtc?app=live&stream=${streamId}&type=push`, {
      method: 'POST',
      body: offer.sdp,
    })

    console.log('publisher receive answer', data.value)

    const { sdp } = data.value as Record<string, string>
    const answer = new RTCSessionDescription({ sdp, type: 'answer' })

    await rtcConn.setRemoteDescription(answer)

    stream.value = s
    pushing.value = true
  }

  async function unpublish() {
    stream.value?.getTracks().forEach(track => track.stop())
    rtcConn?.close()

    if (currentStreamId) {
      useFetch(`//live.npmdev.com/index/api/close_streams?app=live&stream=${currentStreamId}&force=1`, {
        method: 'POST',
      })
    }

    stream.value = undefined
    pushing.value = false
  }

  return {
    stream,
    rtcStatus,
    pushing,
    publish,
    unpublish,
  }
}
