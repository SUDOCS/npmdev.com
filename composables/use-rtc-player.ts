export function useRTCPlayer() {
  const rtcStatus = ref<RTCPeerConnectionState>('closed')
  const stream = shallowRef<MediaStream>()
  const pulling = ref(false)

  let rtcConn: RTCPeerConnection

  async function play(streamId: string) {
    rtcConn = new RTCPeerConnection()
    const ms = new MediaStream()

    rtcConn.addTransceiver('video', { direction: 'recvonly' })
    rtcConn.addTransceiver('audio', { direction: 'recvonly' })

    rtcConn.onconnectionstatechange = () => {
      rtcStatus.value = rtcConn.connectionState

      if (rtcStatus.value === 'connected') {
        pulling.value = true
      }
      else if (rtcStatus.value === 'disconnected' || rtcStatus.value === 'failed') {
        pulling.value = false
      }
    }

    rtcConn.ontrack = (event) => {
      pulling.value = true
      console.log('on track', event)
      ms.addTrack(event.track)
    }

    const offer = await rtcConn.createOffer()
    await rtcConn.setLocalDescription(offer)

    const { data } = await useFetch(`//live.npmdev.com/index/api/webrtc?app=live&stream=${streamId}&type=play`, {
      method: 'POST',
      body: offer.sdp,
    })

    console.log('player receive answer', data.value)

    const { sdp } = data.value as Record<string, string>
    const answer = new RTCSessionDescription({ sdp, type: 'answer' })

    await rtcConn.setRemoteDescription(answer)

    stream.value = ms
    pulling.value = true
  }

  function stop() {
    rtcConn?.close()

    stream.value = undefined
    pulling.value = false
  }

  return {
    pulling,
    stream,
    play,
    stop,
  }
}
