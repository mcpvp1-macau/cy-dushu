import server4A from '@/service/servers/server4A'
import serverJingqi from '@/service/servers/serverJingqi'

/** 获取minio证书 */
export const getMinioSignature = () => {
  return serverJingqi.post('/space/upload/signature', {
    bucketName: globalConfig.bucketName || 'ja-media-storage',
    expiration: 30,
  })
}

export type MinioObjectInfo = {
  bucket: string
  contentType: string
  etag: string
  lastModified: string
  metadata: Record<string, string[]>
  path: string
  size: number
}

export const getMinioObjectInfo = (bucket: string, path: string) => {
  return server4A.get<MinioObjectInfo>('/minio/object-info', {
    params: { bucket, path },
  })
}

export const downloadMinioObject = async (
  bucket: string,
  path: string,
  range?: string,
) => {
  try {
    return await server4A.get<Blob>('/minio/download', {
      params: { bucket, path },
      responseType: 'blob',
      headers: range ? { Range: range } : undefined,
      xCustomConfig: { autoShowMessageOnNotSuccess: false },
    })
  } catch (error: any) {
    if (error instanceof Blob) {
      return error
    }
    if (error?.data instanceof Blob) {
      return error.data
    }
    throw error
  }
}
