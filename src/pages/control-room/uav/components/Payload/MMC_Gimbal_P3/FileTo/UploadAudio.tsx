import { useAppMsg } from '@/hooks/useAppMsg'
import { getMinioSignature } from '@/service/modules/minio'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Upload, UploadProps } from 'antd'
import { MD5 } from 'crypto-js'
import CryptoJS from 'crypto-js'

type PropsType = {
  label?: string
  onUpload: (file) => void
  msg?: boolean
  customRequest?: UploadProps['customRequest']
  accept?: string
}
export const UploadAudio: React.FC<PropsType> = ({
  label,
  onUpload,
  msg,
  customRequest,
  accept,
}) => {
  const msgApi = useAppMsg()

  const dataTimeRef = useRef(0)
  const signatureRef = useRef({})

  const props: UploadProps = {
    name: 'file',
    accept: accept || 'audio/*',
    action: `/upload/${globalConfig.bucketName || 'ja-media-storage'}`,
    headers: {},
    data: async (file) => {
      return {
        ...signatureRef.current,
        key: 'speakerRecord/' + file.url,
      }
    },
    onChange(info) {
      console.info('info', info)
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        msg && msgApi.success('上传成功')
        info.file.originFileObj?.arrayBuffer().then((buffer) => {
          const chunkArray = CryptoJS.lib.WordArray.create(buffer)
          const md5 = MD5(chunkArray).toString()
          onUpload({
            ...info.file,
            name: info.file.name,
            md5,
          })
        })
      } else if (info.file.status === 'error') {
        msg && msgApi.error('上传失败')
      }
    },
    beforeUpload: async (file) => {
      let uploadSignature = signatureRef.current
      // @ts-ignore
      file.url = file.name
      if (
        Date.now() - dataTimeRef.current > 30 * 60 * 1000 ||
        !uploadSignature
      ) {
        const time = Date.now()
        uploadSignature = await getMinioSignature().then((res) => res.data)
        dataTimeRef.current = time
        signatureRef.current = uploadSignature

        return file
      } else {
        //
      }
      return file
    },
    customRequest,
    showUploadList: false,
  }

  return (
    <div className="flex">
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>{label || '上传音频文件'}</Button>
      </Upload>
    </div>
  )
}
