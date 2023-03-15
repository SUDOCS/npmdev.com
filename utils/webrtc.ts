export enum WsRTCAction {
  IceCandidate = 1,
  Offer,
  Answer,
}

// WsData 的 payload 中的 WsRTCData，此时 WsData 中的 action 为 CustomMessage
export interface WsRTCData {
  totalLength?: number
  action: WsRTCAction
  userId: number
  payload?: Uint8Array
}

export function encodeWsRTCData(data: WsRTCData): ArrayBuffer {
  const { action, userId, payload = new ArrayBuffer(0) } = data

  const totalLength = 8 + payload.byteLength

  const header = new ArrayBuffer(8)
  const headerView = new DataView(header)
  headerView.setUint16(0, totalLength)
  headerView.setUint8(2, action)
  headerView.setUint32(4, userId)

  const buffer = new Uint8Array(totalLength)
  buffer.set(new Uint8Array(header), 0)
  buffer.set(new Uint8Array(payload), 8)

  return buffer
}

export function decodeWsRTCData(data: ArrayBuffer): WsRTCData {
  const header = data.slice(0, 8)

  const headerView = new DataView(header)
  const totalLength = headerView.getUint16(0)
  const action = headerView.getUint8(2)
  const userId = headerView.getUint32(4)
  const payload = new Uint8Array(data.slice(8, totalLength))

  return {
    totalLength,
    action,
    userId,
    payload,
  }
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

export function encodeRTCDataChannelData(data: RTCDataChannelData): ArrayBuffer {
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

export function decodeRTCDataChannelData(data: ArrayBuffer): RTCDataChannelData {
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

export function encodeRTCDataChannelFileSlice(data: RTCDataChannelFileSlice): ArrayBuffer {
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

export function decodeRTCDataChannelFileSlice(data: ArrayBuffer): RTCDataChannelFileSlice {
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
