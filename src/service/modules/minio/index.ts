import serverJingqi from '@/service/servers/serverJingqi'

/** 获取minio证书 */
export const getMinioSignature = () => {
  return serverJingqi.post('/space/upload/signature', {
    bucketName: globalConfig.bucketName || 'ja-media-storage',
    expiration: 30,
  })
}
