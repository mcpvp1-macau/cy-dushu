import { useAppMsg } from '@/hooks/useAppMsg'
import { getMinioSignature } from '@/service/modules/minio'
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { Button, Input, message, Modal } from 'antd'

interface AliyunOSSUploadProps {
  value?: string
  onChange?: (data: string) => void
  children: JSX.Element
  otherProps?: UploadProps
  getPath?: (files) => string | boolean
}

const AliyunOSSUpload = ({
  value,
  onChange,
  getPath,
}: AliyunOSSUploadProps) => {
  const msgApi = useAppMsg()

  const dataTimeRef = useRef(0)
  const signatureRef = useRef({})
  const [progress, setProgress] = useState(0)
  const [count, setCount] = useState(0)
  const progressRef = useRef(0)

  const uploadFile = async (file) => {
    const { webkitRelativePath } = file as any
    if (!webkitRelativePath) {
      return
    }

    let uploadSignature = signatureRef.current
    if (Date.now() - dataTimeRef.current > 30 * 60 * 1000) {
      const time = Date.now()
      uploadSignature = await getMinioSignature().then((res) => res.data)
      dataTimeRef.current = time
      signatureRef.current = uploadSignature
    } else {
      //
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('key', webkitRelativePath)
    formData.append('x-amz-algorithm', uploadSignature['x-amz-algorithm'])
    formData.append('x-amz-credential', uploadSignature['x-amz-credential'])
    formData.append('x-amz-signature', uploadSignature['x-amz-signature'])
    formData.append('x-amz-date', uploadSignature['x-amz-date'])
    formData.append('policy', uploadSignature['policy'])

    const res = await fetch(
      `/upload/${globalConfig.bucketName || 'minio-map'}`,
      {
        method: 'POST',
        body: formData,
      },
    )

    if (res.status.toString().startsWith('20')) {
      progressRef.current += 1
      setProgress((v) => v + 1)
    } else {
      setCount(0)
      progressRef.current = 0
      setProgress(0)
      msgApi.error('上传失败，请重试')
    }
  }

  const onUploadFile = async (e) => {
    const files = e.target.files
    // let is3d = false
    // let value = ''
    // for (let index = 0; index < files.length; index++) {
    //   const element = files[index]
    //   if (element.name === 'tileset.json') {
    //     is3d = true
    //     value = element.webkitRelativePath
    //     break
    //   }
    // }
    // if (!is3d) {
    //   message.error('请确认文件夹中是否含有tileset.json')
    //   return
    // }
    const value = getPath?.(files)
    if (!value) {
      return
    }
    setCount(files.length)
    progressRef.current = 0

    for (let index = 0; index < files.length; index++) {
      const element = files[index]
      await uploadFile(element)
    }

    setCount(0)
    progressRef.current = 0
    message.success('上传成功')
    onChange?.(`/storage/${globalConfig.bucketName || 'minio-map'}${value}`)
  }

  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="flex">
      <Input value={value} onChange={(e) => onChange?.(e.target.value)} />
      <input
        type="file"
        className={'!hidden'}
        onChange={onUploadFile}
        // @ts-ignore
        directory={'true'}
        webkitdirectory={'true'}
        multiple
        ref={ref}
      />
      <Button onClick={() => ref.current?.click()}>
        <UploadOutlined />
      </Button>
      <Modal
        open={!!count}
        title=""
        maskClosable={false}
        footer={null}
        closable={false}
      >
        <div className="flex-col items-center justify-center p-4">
          <div className="text-center">
            {progressRef.current ? '文件上传中' : '文件读取中'}，请稍后
          </div>
          <div className="text-center">
            {progressRef.current} / {count} <LoadingOutlined />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AliyunOSSUpload
