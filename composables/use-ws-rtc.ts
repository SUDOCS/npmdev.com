import { WsPayloadType } from './../utils/websocket'
import type { UseRTCOptions } from './use-rtc'
import type { UseWsOptions } from './use-ws'

export function useWsRTC(options: UseWsOptions & UseRTCOptions) {
  options.messageHandler = handleWsAppMessage

  const { roomId, senderId, roomUserIds, wsStatus, openWebsocket, sendAppMsg } = useWs(options)

  options.sendAppMessage = sendAppMsg

  const { rtcStatus, dataChannelStatus, startWebRTC, sendFileWithRTC, processRTCSignalingData } = useRTC(options)

  function handleWsAppMessage(sender: number, type: WsPayloadType, data: ArrayBuffer) {
    switch (type) {
      case WsPayloadType.WebRTC: {
        if (rtcStatus.value === 'notcreated') { // 接收者被动启动 WebRTC
          startWebRTC()
        }

        processRTCSignalingData(sender, data)

        break
      }
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
