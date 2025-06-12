import serverControlCenter from '@/service/servers/serverControlCenter'
import serverDushu from '@/service/servers/serverDushu'
import serverVideo from '@/service/servers/serverVideo'
import serverAK from '@/service/servers/serverAK'
import type { GenericAbortSignal } from 'axios'

export const live = (
  productKey: string,
  deviceId: string,
  data: {
    videoId: string
  },
  signal?: GenericAbortSignal,
) => {
  return serverControlCenter.post(
    `/v3/service/${productKey}/${deviceId}/live/post`,
    {
      action: 'START',
      protocol: 'WS_FLV',
      ssl: globalConfig.globalWs === 'wss',
      type: 'AI_FRAME',
      proxy: globalConfig.videoProxy || false,
      ...data,
    },
    {
      signal,
      xCustomConfig: {
        autoShowMessageOnNotSuccess: false,
      },
    },
  )
}

export const liveAK = (
  productKey: string,
  deviceId: string,
  data: {
    videoId: string
  },
  signal?: GenericAbortSignal,
) => {
  return serverAK.post(
    `/controlServer/v3/service/${productKey}/${deviceId}/live/post`,
    {
      action: 'START',
      protocol: 'WS_FLV',
      ssl: globalConfig.globalWs === 'wss',
      type: 'AI_FRAME',
      proxy: globalConfig.videoProxy || false,
      ...data,
    },
    {
      signal,
      xCustomConfig: {
        autoShowMessageOnNotSuccess: false,
      },
    },
  )
}


/** 设置视频质量 */
export const setLiveQuality = (data: any) => {
  return serverVideo.post('/stream/setQualityLevel', data)
}

/** 设备算法视频流列表 */
export const getDeviceStreamList = async (params: {
  streamId: string
  protocol?: string
  ssl?: boolean
  proxy?: boolean
}) => {
  return serverDushu.get<
    {
      transport: string
      playUrl: string
      sourceAccessProtocol: any
      appName: string
    }[]
  >('/device/stream/list', {
    params: {
      protocol: 'WS_FLV',
      ssl: globalConfig.globalWs === 'wss',
      proxy: globalConfig.videoProxy || false,
      ...params,
    },
    xCustomConfig: {
      autoShowMessageOnNotSuccess: false,
    },
  })
}


/** 设备算法视频流列表 */
export const getDeviceStreamListAK = async (params: {
  streamId: string
  protocol?: string
  ssl?: boolean
  proxy?: boolean
}) => {
  return serverAK.get<
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
      ...params,
    },
    xCustomConfig: {
      autoShowMessageOnNotSuccess: false,
    },
  })
}
