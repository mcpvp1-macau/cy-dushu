import serverVideo from '@/service/servers/serverVideo'

/** 获取视频质量 */
export const getStreamQualityLevel = (data) => {
  return serverVideo.post('/stream/getQualityLevel', data, {
    xCustomConfig: {
      autoShowMessageOnNotSuccess: false,
    },
  })
}
