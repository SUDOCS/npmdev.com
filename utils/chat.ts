export enum ChatMessageType {
  Text = 1,
  Image,
  Audio,
  Video,
  File,
}

export interface ChatMessage {
  totalLength?: number // 2 bytes
  type: ChatMessageType // 2 bytes
  payload: ArrayBuffer
}

export function encodeChatMessage(data: ChatMessage): ArrayBuffer {
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

export function decodeChatMessage(data: ArrayBuffer): ChatMessage {
  const view = new DataView(data)

  const totalLength = view.getUint16(0)
  const type = view.getUint16(2) as ChatMessageType

  const payload = data.slice(4)

  return {
    totalLength,
    type,
    payload,
  }
}

export interface TextMessage {
  text: string
}

export function encodeTextMessage(data: TextMessage): ArrayBuffer {
  return new TextEncoder().encode(data.text)
}

export function decodeTextMessage(data: ArrayBuffer): TextMessage {
  return {
    text: new TextDecoder().decode(data),
  }
}

export interface ImageMessage {
  image: ArrayBuffer
}

export function encodeImageMessage(data: ImageMessage): ArrayBuffer {
  return data.image
}

export function decodeImageMessage(data: ArrayBuffer): ImageMessage {
  return {
    image: data,
  }
}
