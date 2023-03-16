import { WsPayloadType } from '../utils/websocket'
import type { UseRTCFileTransferOptions } from './use-rtc-file-transfer'
import type { UseWsOptions } from './use-ws'

export function useWsRTCFileTransfer(options: UseWsOptions & UseRTCFileTransferOptions) {
  options.messageHandler = handleWsAppMessage

  const { roomId, senderId, roomUserIds, wsStatus, openWebsocket, sendAppMsg } = useWs(options)

  options.sendAppMessage = sendAppMsg

  const { rtcStatus, dataChannelStatus, startWebRTC, sendFileWithRTC, processRTCSignalingData } = useRTCFileTransfer(options)

  function handleWsAppMessage(sender: number, type: WsPayloadType, data: ArrayBuffer) {
    if (type === WsPayloadType.WebRTC) {
      if (rtcStatus.value === 'notcreated') { // 接收者被动启动 WebRTC
        startWebRTC()
      }

      processRTCSignalingData(sender, data)
    }
  }

  return {
    roomId,
    senderId,
    roomUserIds,
    wsStatus,
    rtcStatus,
    dataChannelStatus,
    openWebsocket,
    startWebRTC,
    sendFileWithRTC,
  }
}
