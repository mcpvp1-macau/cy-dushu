import serverShare from '@/service/servers/serverShare'
import type { GenericAbortSignal } from 'axios'

export const liveShare = (
  productKey: string,
  deviceId: string,
  data: {
    videoId: string
    AccessKeyId: string
    Signature: string
  },
  signal?: GenericAbortSignal,
) => {
  return serverShare.post(
    `/controlServer/v3/service/${productKey}/${deviceId}/live/post`,
    {
      action: 'START',
      protocol: 'WS_FLV',
      ssl: globalConfig.globalWs === 'wss',
      type: 'AI_FRAME',
      proxy: globalConfig.videoProxy || false,
      videoId: data.videoId,
    },
    {
      params: {
        AccessKeyId: data.AccessKeyId,
        Signature: data.Signature,
      },
      signal,
      xCustomConfig: {
        autoShowMessageOnNotSuccess: false,
      },
    },
  )
}

export const getDeviceStreamListShare = async (params: {
  streamId: string
  AccessKeyId: string
  Signature: string
  protocol?: string
  ssl?: boolean
  proxy?: boolean
}) => {
  const { AccessKeyId, Signature, ...restParams } = params
  return serverShare.get<
    {
      transport: string
      playUrl: string
      sourceAccessProtocol: any
      appName: string
    }[]
  >('/jingqiServer/device/stream/list', {
    params: {
      protocol: 'WS_FLV',
      ssl: globalConfig.globalWs === 'wss',
      proxy: globalConfig.videoProxy || false,
      ...restParams,
      AccessKeyId,
      Signature,
    },
    xCustomConfig: {
      autoShowMessageOnNotSuccess: false,
    },
  })
}
