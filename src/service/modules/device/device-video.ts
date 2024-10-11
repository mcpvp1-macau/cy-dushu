import serverControlCenter from '@/service/servers/serverControlCenter'
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
