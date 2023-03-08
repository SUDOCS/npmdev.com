const iceServers: RTCIceServer[] = [
  { urls: 'stun:server.npmdev.com' },
]

export function NewRTCPeerConnection() {
  return new RTCPeerConnection({
    iceServers,
  })
}

class RTCBase {
  protected pc: RTCPeerConnection

  constructor() {
    const pc = NewRTCPeerConnection()

    pc.onconnectionstatechange = (event: Event) => {
      console.log(event)
    }

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      console.log(event)
    }

    this.pc = pc
  }

  async createOffer() {
    const offer = await this.pc.createOffer()
    this.pc.setLocalDescription(offer)

    return offer
  }

  async setOfferOrAnswer(sdp: RTCSessionDescriptionInit) {
    await this.pc.setRemoteDescription(sdp)
  }

  async createAnswer() {
    const answer = await this.pc.createAnswer()
    this.pc.setLocalDescription(answer)
    return answer
  }

  onChannelOpen(event: Event) {
    console.log(event)
  }

  onChannelMessage(event: MessageEvent) {
    console.log(event)
  }

  onChannelClose(event: Event) {
    console.log(event)
  }

  bindDataChannelEvent(channel: RTCDataChannel) {
    channel.onopen = this.onChannelOpen
    channel.onmessage = this.onChannelOpen
    channel.onclose = this.onChannelClose
  }
}

export class FileSender extends RTCBase {
  private channel: RTCDataChannel

  constructor() {
    super()
    const channel = this.pc.createDataChannel('file')

    this.bindDataChannelEvent(channel)

    this.channel = channel
  }
}

export class FileReceiver extends RTCBase {
  private channel: RTCDataChannel

  constructor() {
    super()
    this.pc.ondatachannel = this.onDataChannel
  }

  onDataChannel(event: RTCDataChannelEvent) {
    const channel = event.channel
    this.bindDataChannelEvent(channel)

    this.channel = channel
  }
}
