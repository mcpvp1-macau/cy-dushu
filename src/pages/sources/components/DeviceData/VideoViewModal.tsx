import IconButton from '@/components/ui/button/IconButton'
import VideoPlayer from '@/components/VideoS/components/VideoPlayer'
import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getVodUrl } from '@/service/modules/video'
import { DownloadOutlined } from '@ant-design/icons'

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

  const handleDownloadClick = async () => {
    if (data.isDevice) {
      window.open(data.playUrl, 'download')
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
      msgApi.error('play url is not exist')
    }
  }

  return (
    <XModal
      open={true}
      title={
        <div className="flex-1 flex justify-between mr-2">
          <p>{`历史视频 ${data.startTime} - ${data.endTime}`}</p>
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
