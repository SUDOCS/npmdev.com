export enum WsAction {
  // client -> server
  JoinRoom = 1,
  LeaveRoom,
  CustomMessage,
  FetchRoomInfo,

  // server -> client
  SendClientInfo = 128,
  SendRoomUserIds,
}

export enum WsPayloadType {
  Text = 0,
  Binary,
}

export interface WsData {
  action: WsAction
  payloadType?: WsPayloadType
  room: number
  sender: number
  payload?: ArrayBuffer
}

const WsHeaderLen = 12

export function buildWsData(data: WsData): ArrayBuffer {
  const { action, payloadType = WsPayloadType.Binary, room, sender, payload = new ArrayBuffer(0) } = data

  const totalLength = WsHeaderLen + payload.byteLength

  const header = new ArrayBuffer(WsHeaderLen)
  const headerView = new DataView(header)
  headerView.setUint16(0, totalLength)
  headerView.setUint8(2, action)
  headerView.setUint8(3, payloadType)
  headerView.setUint32(4, room)
  headerView.setUint32(8, sender)

  const buffer = new Uint8Array(totalLength)
  buffer.set(new Uint8Array(header), 0)
  buffer.set(new Uint8Array(payload), WsHeaderLen)

  return buffer
}

export async function parseWsData(data: ArrayBuffer | Blob): Promise<WsData> {
  if (data instanceof Blob) {
    data = await data.arrayBuffer()
  }

  const header = data.slice(0, WsHeaderLen)

  const headerView = new DataView(header)
  const totalLength = headerView.getUint16(0)
  const action = headerView.getUint8(2)
  const payloadType = headerView.getUint8(3)
  const room = headerView.getUint32(4)
  const sender = headerView.getUint32(8)
  const payload = data.slice(WsHeaderLen, totalLength)
  console.log('payload', payload)

  return {
    action,
    payloadType,
    room,
    sender,
    payload,
  }
}

export interface RoomInfo {
  users: number[]
}

/*
处理 SetupClient 下发的房间数据信息
四个字节一个用户 ID，大端模式
 */
export function parseRoomInfo(payload: ArrayBuffer): RoomInfo {
  const users = []

  const view = new DataView(payload)
  let offset = 0

  const userCount = Math.floor(payload.byteLength / 4)

  for (let i = 0; i < userCount; i++) {
    const userId = view.getUint32(offset)
    users.push(userId)

    offset += 4
  }

  return {
    users,
  }
}

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

export function buildWsRTCData(data: WsRTCData): ArrayBuffer {
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

export function parseWsRTCData(data: ArrayBuffer): WsRTCData {
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
