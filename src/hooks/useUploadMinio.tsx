import { getMinioSignature } from '@/service/modules/minio'
import { message } from 'antd'

export const useUploadMinio = (path = '') => {
  const dataTimeRef = useRef(0)
  const signatureRef = useRef({})
  const fetchSignature = async () => {
    let uploadSignature = signatureRef.current
    if (Date.now() - dataTimeRef.current > 30 * 60 * 1000 || !uploadSignature) {
      const time = Date.now()
      uploadSignature = await getMinioSignature().then((res) => res.data)
      dataTimeRef.current = time
      signatureRef.current = uploadSignature
    }
    return signatureRef.current
  }

  const uploadToMinio = async (file: File, key?: string) => {
    const signature = await fetchSignature()
    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'key',
      path ? `${path}/${key || file.name}` : key || file.name,
    )
    formData.append('x-amz-algorithm', signature['x-amz-algorithm'])
    formData.append('x-amz-credential', signature['x-amz-credential'])
    formData.append('x-amz-signature', signature['x-amz-signature'])
    formData.append('x-amz-date', signature['x-amz-date'])
    formData.append('policy', signature['policy'])

    const res = await fetch(
      `/upload/${globalConfig.bucketName || 'ja-media-storage'}`,
      {
        method: 'POST',
        body: formData,
      },
    )
    if (!res.status.toString().startsWith('20')) {
      message.error('上传失败，请重试')
      return false
    }
    return {
      file,
      name: key || file.name,
      response: res,
      url: `/storage/${globalConfig.bucketName || 'ja-media-storage'}${path ? `/${path}` : ''}/${
        key || file.name
      }`,
    }
  }
  return { signature: signatureRef, fetchSignature, uploadToMinio }
}
