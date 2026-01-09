import { useAppMsg } from '@/hooks/useAppMsg'
import {
  downloadMinioObject,
  getMinioObjectInfo,
} from '@/service/modules/minio'
import { Button, Spin } from 'antd'
import { nanoid } from 'nanoid'

const MIN_CHUNK_SIZE = 5 * 1024 * 1024
const MAX_CHUNK_SIZE = 20 * 1024 * 1024
const TARGET_CHUNK_COUNT = 8

type StoragePath = {
  bucket: string
  path: string
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

/** 提供设备视频分片下载的重试与取消能力 */
const useVideoChunkDownload = () => {
  const msgApi = useAppMsg()
  const [t] = useTranslation()

  /** 更新下载进度提示并提供取消按钮 */
  const updateDownloadingMessage = useMemoizedFn(
    (key: string, percent: number, onCancel: () => void) => {
      msgApi.open({
        key,
        content: (
          <div className="flex items-center gap-2">
            <Spin size="small" percent={percent} />
            <span>{t('video.downloading')}</span>
            <Button size="small" onClick={onCancel}>
              {t('video.cancel', { defaultValue: '取消' })}
            </Button>
          </div>
        ),
        duration: 0,
      })
    },
  )

  /** 弹出失败提示并等待用户选择重试或取消 */
  const waitForRetryOrCancel = useMemoizedFn(
    (key: string, onCancel: () => void) => {
      return new Promise<'retry' | 'cancel'>((resolve) => {
        msgApi.open({
          key,
          content: (
            <div className="flex items-center gap-2">
              <span>
                {t('video.downloadFailed', { defaultValue: '视频下载失败' })}
              </span>
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
                  onCancel()
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
    },
  )

  /** 分片下载并在失败时允许重试/取消 */
  const downloadWithRange = useMemoizedFn(
    async (storagePath: StoragePath, size: number) => {
      const key = nanoid()
      let isCanceled = false

      // 业务规则：取消状态由用户触发并阻止后续下载
      const handleCancel = () => {
        isCanceled = true
      }

      updateDownloadingMessage(key, 1, handleCancel)
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
            const blob = await downloadMinioObject(
              storagePath.bucket,
              storagePath.path,
              range,
            )
            chunks.push(blob)
            start = end + 1
            updateDownloadingMessage(
              key,
              Math.round((start / size) * 100),
              handleCancel,
            )
          } catch (_error) {
            // 边界场景：分片失败后允许用户重试继续下载
            const action = await waitForRetryOrCancel(key, handleCancel)
            if (action === 'cancel' || isCanceled) {
              return null
            }
          }
        }
        return new Blob(chunks)
      } finally {
        msgApi.destroy(key)
      }
    },
  )

  /** 下载设备视频并合并分片 */
  const downloadDeviceVideo = useMemoizedFn(async (playUrl: string) => {
    const parsed = parseStoragePath(playUrl)
    if (!parsed) {
      msgApi.error(
        t('video.parseUrlFailed', { defaultValue: '无法解析视频地址' }),
      )
      return null
    }

    const infoResp = await getMinioObjectInfo(parsed.bucket, parsed.path)
    if (!infoResp.data) {
      msgApi.error(
        t('video.objectInfoMissing', { defaultValue: '未获取到对象信息' }),
      )
      return null
    }

    const mergedBlob = await downloadWithRange(parsed, infoResp.data.size)
    if (!mergedBlob) {
      return null
    }

    return {
      blob: mergedBlob,
      filename: parsed.path.split('/').pop() || 'video',
      contentType: infoResp.data.contentType,
    }
  })

  return {
    downloadDeviceVideo,
  }
}

export default useVideoChunkDownload
