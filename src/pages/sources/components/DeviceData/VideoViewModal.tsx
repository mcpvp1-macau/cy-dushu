import IconButton from '@/components/ui/button/IconButton'
import VideoPlayer from '@/components/VideoS/components/VideoPlayer'
import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getVodUrl } from '@/service/modules/video'
import { DownloadOutlined } from '@ant-design/icons'
import { FC, memo } from 'react'
import useVideoChunkDownload from './useVideoChunkDownload'

type PropsType = {
  /** data 存在时 自动打开 */
  // data: API_DEVICE.domain.HistoryVideoListItem
  data: {
    /** 是否为机身视频 */
    isDevice?: boolean
    playUrl: string
    startTime: string
    endTime: string
  }
  onClose?: () => void
}

/** 视频播放对话框 */
const VideoViewModal: FC<PropsType> = memo(({ data, onClose }) => {
  const msgApi = useAppMsg()
  const [t] = useTranslation()
  const { downloadDeviceVideo } = useVideoChunkDownload()

  /** 处理机身视频下载 */
  const handleDeviceDownload = useMemoizedFn(async () => {
    const downloadData = await downloadDeviceVideo(data.playUrl)
    if (!downloadData) {
      return
    }

    const link = document.createElement('a')
    const url = URL.createObjectURL(
      new Blob([downloadData.blob], { type: downloadData.contentType }),
    )
    link.href = url
    link.download = downloadData.filename
    link.click()
    URL.revokeObjectURL(url)
  })

  /** 触发下载逻辑并处理错误提示 */
  const handleDownloadClick = useMemoizedFn(async () => {
    try {
      if (data.isDevice) {
        await handleDeviceDownload()
        return
      }
      if (data.playUrl) {
        const resp = await getVodUrl(data.playUrl)
        if (resp.data?.location) {
          let url = resp.data.location + '&proxy=true'
          if (globalConfig.vodVideoUrl) {
            url = url.replace(globalConfig.vodVideoUrl, '')
          }
          window.open(url, 'download')
        } else {
          msgApi.error(resp.message)
        }
      } else {
        msgApi.error(
          t('video.playUrlMissing', { defaultValue: 'play url is not exist' }),
        )
      }
    } catch (error: any) {
      msgApi.error(
        error?.message ||
          t('video.downloadFailed', { defaultValue: '视频下载失败' }),
      )
    }
  })

  return (
    <XModal
      open={true}
      title={
        <div className="flex-1 flex justify-between mr-2">
          <p>
            {t('video.historyTitle', {
              defaultValue: '历史视频',
            })}
            {` ${data.startTime} - ${data.endTime}`}
          </p>
          <IconButton onClick={handleDownloadClick}>
            <DownloadOutlined className="scale-110" />
          </IconButton>
        </div>
      }
      footer={false}
      width={800}
      noPadding
      onClose={onClose}
    >
      <VideoPlayer src={data.playUrl} />
    </XModal>
  )
})

VideoViewModal.displayName = 'VideoViewModal'

export default VideoViewModal
