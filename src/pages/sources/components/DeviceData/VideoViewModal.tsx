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
import { Button, Spin } from 'antd'
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

/** 解析存储路径并返回桶和对象路径 */
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

/** 计算分片下载的单片大小 */
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

  /** 分片下载并在失败时允许重试/取消 */
  const downloadWithRange = async (
    bucket: string,
    path: string,
    size: number,
  ) => {
    const key = nanoid()
    let isCanceled = false

    /** 更新下载进度提示并提供取消按钮 */
    const updateDownloadingMessage = (percent: number) => {
      msgApi.open({
        key,
        content: (
          <div className="flex items-center gap-2">
            <Spin size="small" percent={percent} />
            <span>{t('video.downloading')}</span>
            <Button
              size="small"
              onClick={() => {
                // 业务规则：用户主动取消时终止后续分片请求
                isCanceled = true
              }}
            >
              {t('video.cancel', { defaultValue: '取消' })}
            </Button>
          </div>
        ),
        duration: 0,
      })
    }

    /** 弹出失败提示并等待用户选择重试或取消 */
    const waitForRetryOrCancel = async () => {
      return new Promise<'retry' | 'cancel'>((resolve) => {
        msgApi.open({
          key,
          content: (
            <div className="flex items-center gap-2">
              <span>{t('video.downloadFailed', { defaultValue: '视频下载失败' })}</span>
              <Button
                size="small"
                type="primary"
                onClick={() => resolve('retry')}
              >
                {t('video.retry', { defaultValue: '重试' })}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  // 业务规则：用户取消时立即退出下载流程
                  isCanceled = true
                  resolve('cancel')
                }}
              >
                {t('video.cancel', { defaultValue: '取消' })}
              </Button>
            </div>
          ),
          duration: 0,
        })
      })
    }

    updateDownloadingMessage(1)
    try {
      const chunkSize = getChunkSize(size)
      const chunks: Blob[] = []
      let start = 0

      while (start < size) {
        if (isCanceled) {
          return null
        }
        const end = Math.min(start + chunkSize - 1, size - 1)
        const range = `bytes=${start}-${end}`
        try {
          const blob = await downloadMinioObject(bucket, path, range)
          chunks.push(blob)
          start = end + 1
          updateDownloadingMessage(Math.round((start / size) * 100))
        } catch (_error) {
          // 边界场景：分片失败后允许用户重试继续下载
          const action = await waitForRetryOrCancel()
          if (action === 'cancel' || isCanceled) {
            return null
          }
        }
      }
      return new Blob(chunks)
    } finally {
      msgApi.destroy(key)
    }
  }

  /** 处理机身视频下载 */
  const handleDeviceDownload = async () => {
    const parsed = parseStoragePath(data.playUrl)
    if (!parsed) {
      msgApi.error(
        t('video.parseUrlFailed', { defaultValue: '无法解析视频地址' }),
      )
      return
    }

    const infoResp = await getMinioObjectInfo(parsed.bucket, parsed.path)
    if (!infoResp.data) {
      msgApi.error(
        t('video.objectInfoMissing', { defaultValue: '未获取到对象信息' }),
      )
      return
    }

    const mergedBlob = await downloadWithRange(
      parsed.bucket,
      parsed.path,
      infoResp.data.size,
    )
    if (!mergedBlob) {
      return
    }

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

  /** 触发下载逻辑并处理错误提示 */
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
  }

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
