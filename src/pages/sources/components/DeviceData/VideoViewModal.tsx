import IconButton from '@/components/ui/button/IconButton'
import VideoPlayer from '@/components/VideoS/components/VideoPlayer'
import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  downloadMinioObject,
  getMinioObjectInfo,
} from '@/service/modules/minio'
import { getVodUrl } from '@/service/modules/video'
import { DownloadOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import { nanoid } from 'nanoid'
import { FC, memo } from 'react'

const MIN_CHUNK_SIZE = 5 * 1024 * 1024
const MAX_CHUNK_SIZE = 20 * 1024 * 1024
const TARGET_CHUNK_COUNT = 8

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

const parseStoragePath = (url: string) => {
  const trimmed = url.startsWith('/') ? url.slice(1) : url
  if (!trimmed.startsWith('storage/')) {
    return null
  }
  const [, bucket, ...path] = trimmed.split('/')
  if (!bucket || path.length === 0) {
    return null
  }
  return { bucket, path: path.join('/') }
}

const getChunkSize = (size: number) => {
  if (size <= MIN_CHUNK_SIZE) {
    return size
  }
  const estimated = Math.ceil(size / TARGET_CHUNK_COUNT)
  return Math.min(MAX_CHUNK_SIZE, Math.max(MIN_CHUNK_SIZE, estimated))
}

/** 视频播放对话框 */
const VideoViewModal: FC<PropsType> = memo(({ data, onClose }) => {
  const msgApi = useAppMsg()
  const [t] = useTranslation()

  const downloadWithRange = async (
    bucket: string,
    path: string,
    size: number,
  ) => {
    const key = nanoid()
    msgApi.open({
      key,
      content: (
        <div className="flex items-center gap-2">
          <Spin size="small" percent={1} />
          {t('video.downloading')}
        </div>
      ),
      duration: 0,
    })
    try {
      const chunkSize = getChunkSize(size)
      const chunks: Blob[] = []
      let start = 0

      while (start < size) {
        const end = Math.min(start + chunkSize - 1, size - 1)
        const range = `bytes=${start}-${end}`
        const blob = await downloadMinioObject(bucket, path, range)
        chunks.push(blob)
        start = end + 1
        msgApi.open({
          key,
          content: (
            <div className="flex items-center gap-2">
              <Spin size="small" percent={Math.round((start / size) * 100)} />
              {t('video.downloading')}
            </div>
          ),
          duration: 0,
        })
      }
      return new Blob(chunks)
    } finally {
      msgApi.destroy(key)
    }
  }

  const handleDeviceDownload = async () => {
    const parsed = parseStoragePath(data.playUrl)
    if (!parsed) {
      msgApi.error('无法解析视频地址')
      return
    }

    const infoResp = await getMinioObjectInfo(parsed.bucket, parsed.path)
    if (!infoResp.data) {
      msgApi.error('未获取到对象信息')
      return
    }

    const mergedBlob = await downloadWithRange(
      parsed.bucket,
      parsed.path,
      infoResp.data.size,
    )

    const link = document.createElement('a')
    const filename = parsed.path.split('/').pop() || 'video'
    const url = URL.createObjectURL(
      new Blob([mergedBlob], { type: infoResp.data.contentType }),
    )
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadClick = async () => {
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
        msgApi.error('play url is not exist')
      }
    } catch (error: any) {
      msgApi.error(error?.message || '视频下载失败')
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
