export enum WsAction {
  // client -> server
  JoinRoom = 1,
  LeaveRoom,
  ApplicationMessage,
  FetchRoomInfo,

  // server -> client
  SendClientInfo = 128,
  SendRoomUserIds,
}

export enum WsPayloadType {
  // 用作WebSocket自身的消息，比如加入房间、离开房间等
  Reserved = 1,
  // 用作应用层的消息，比如WebRTC、屏幕共享等
  WebRTC,
  ScreenShare,
}

export interface WsData {
  action: WsAction
  // payload 的数据为哪个应用服务，根据这个寻找对应的解析方法
  payloadType?: WsPayloadType
  room: number
  sender: number
  payload?: ArrayBuffer
}

const WsHeaderLen = 12

export function buildWsData(data: WsData): ArrayBuffer {
  const { action, payloadType = WsPayloadType.Reserved, room, sender, payload = new ArrayBuffer(0) } = data

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

export async function decodeWsData(data: ArrayBuffer | Blob): Promise<WsData> {
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
export function decodeRoomInfo(payload: ArrayBuffer): RoomInfo {
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
