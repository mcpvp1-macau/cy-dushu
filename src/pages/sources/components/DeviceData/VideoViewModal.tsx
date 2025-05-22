import IconButton from '@/components/ui/button/IconButton'
import VideoPlayer from '@/components/VideoS/components/VideoPlayer'
import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getVodUrl } from '@/service/modules/video'
import { DownloadOutlined } from '@ant-design/icons'
import { saveAs } from 'file-saver'

type PropsType = {
  /** data 存在时 自动打开 */
  data: API_DEVICE.domain.HistoryVideoListItem
  onClose?: () => void
}

// 创建blob对象
function downloadBlob(url: string, name?: string) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'blob'

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(xhr.response)
      } else {
        reject(new Error(xhr.statusText || 'Download failed.'))
      }
    }
    xhr.onerror = function () {
      reject(new Error('Download failed.'))
    }
    xhr.send()
  })
}

/** 视频播放对话框 */
const VideoViewModal: FC<PropsType> = memo(({ data, onClose }) => {
  const msgApi = useAppMsg()

  // 主要用于下载导出的代码
  const downloadFile = (url: string, fileName = '') => {
    msgApi.loading({
      content: '正在下载视频, 请稍候~',
      duration: 0,
      key: url,
    })

    return downloadBlob(url, fileName)
      .then((resp: any) => {
        if (resp.blob) {
          return resp.blob()
        } else {
          return new Blob([resp])
        }
      })
      .then((blob: any) => URL.createObjectURL(blob))
      .then((url: any) => {
        // downloadURL(url, fileName)
        // URL.revokeObjectURL(url)
        saveAs(url, fileName)
        msgApi.destroy(url)
      })
      .catch((err) => {
        throw new Error(err.message)
      })
  }

  const downloadUrl = (url: string, name?: string) => {
    downloadFile(url, name)
  }

  const handleDownloadClick = async () => {
    if (data.playUrl) {
      // if (data.playUrl.includes('.mp4')) {
      //   // downloadUrl(data.playUrl, 'download.mp4')
      //   window.open(data.playUrl, 'download')
      //   return
      // }
      const resp = await getVodUrl(data.playUrl)
      if (resp.data?.location) {
        let url = resp.data.location + '&proxy=true'
        if (globalConfig.vodVideoUrl) {
          url = url.replace(globalConfig.vodVideoUrl, '')
        }
        // saveAs(url)
        window.open(url, 'download')
        // downloadUrl(url, 'download.mp4')
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
          <p>{`历史视频 ${data.timeRange[0]} - ${data.timeRange[1]}`}</p>
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
