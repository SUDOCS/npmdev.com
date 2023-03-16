export enum WsLiveAction {
  Publish = 1,
  Message,
}

export interface WsLiveData {
  totalLength?: number // 2 bytes
  action: WsLiveAction // 2 bytes
  userId: number // 4 bytes
  payload: ArrayBuffer
}

export function encodeWsLiveData(data: WsLiveData): ArrayBuffer {
  const { action, userId, payload } = data

  const totalLength = 8 + payload.byteLength

  const buffer = new ArrayBuffer(totalLength)
  const view = new DataView(buffer)

  view.setUint16(0, totalLength)
  view.setUint16(2, action)
  view.setUint32(4, userId)

  const payloadView = new Uint8Array(buffer, 8)
  payloadView.set(new Uint8Array(payload))

  return buffer
}

export function decodeWsLiveData(data: ArrayBuffer): WsLiveData {
  const view = new DataView(data)

  const totalLength = view.getUint16(0)
  const action = view.getUint16(2) as WsLiveAction
  const userId = view.getUint32(4)

  const payload = data.slice(8)

  return {
    totalLength,
    action,
    userId,
    payload,
  }
}

export interface LiveInfo {
  liveNameLen?: number // 2 bytes
  liveName: string
}

export function encodeLiveInfo(data: LiveInfo): ArrayBuffer {
  const { liveName } = data

  const liveNameBuffer = new TextEncoder().encode(liveName)

  const totalLength = 2 + liveNameBuffer.byteLength

  const buffer = new ArrayBuffer(totalLength)
  const view = new DataView(buffer)

  view.setUint16(0, totalLength)

  const payloadView = new Uint8Array(buffer, 2)
  payloadView.set(new Uint8Array(liveNameBuffer))

  return buffer
}

export function decodeLiveInfo(data: ArrayBuffer): LiveInfo {
  const view = new DataView(data)

  const liveNameLen = view.getUint16(0)
  const liveName = new TextDecoder().decode(data.slice(2, 2 + liveNameLen))

  return {
    liveNameLen,
    liveName,
  }
}
