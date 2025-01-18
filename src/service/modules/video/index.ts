import serverVideo, { serverVod } from '@/service/servers/serverVideo'

/** 获取视频质量 */
export const getStreamQualityLevel = (data) => {
  return serverVideo.post('/stream/getQualityLevel', data, {
    xCustomConfig: {
      autoShowMessageOnNotSuccess: false,
    },
  })
}

/** 获取下载地址 */
export const getVodUrl = (hlsUrl: string) => {
  return serverVod.post('/vod/getVodUrl', { hlsUrl })
}
