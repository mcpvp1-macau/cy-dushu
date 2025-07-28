import IconButton from '@/components/ui/button/IconButton'
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
  getPath?: (files: FileList) => string | boolean
  /**先出发getPath，再触发filesFilter */
  filesFilter?: (files: FileList) => File[]
}

const AliyunOSSUpload = ({
  value,
  onChange,
  getPath,
  filesFilter,
}: AliyunOSSUploadProps) => {
  const msgApi = useAppMsg()
  const [t] = useTranslation()

  const dataTimeRef = useRef(0)
  const signatureRef = useRef({})
  const [progress, setProgress] = useState(0)
  const [count, setCount] = useState(0)
  const progressRef = useRef(0)
  const isCloseRef = useRef(false)

  const uploadFile = async (file: File) => {
    const { webkitRelativePath } = file
    if (!webkitRelativePath) {
      return
    }

    let uploadSignature = signatureRef.current
    if (Date.now() - dataTimeRef.current > 30 * 60 * 1000 || !uploadSignature) {
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
      `/upload/${globalConfig.bucketName || 'ja-media-storage'}`,
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
    isCloseRef.current = false
    let files = e.target.files
    const value = getPath?.(files)

    files = !!filesFilter ? filesFilter(files) : files

    if (!value) {
      return
    }
    setCount(files.length)
    progressRef.current = 0

    for (let index = 0; index < files.length; index++) {
      const element = files[index]
      if (isCloseRef.current) {
        return
      }
      await uploadFile(element)
    }

    setCount(0)
    progressRef.current = 0
    message.success('上传成功')
    onChange?.(
      `/storage/${globalConfig.bucketName || 'ja-media-storage'}/${value}`,
    )
  }

  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="flex">
      <Input
        value={value}
        placeholder={t('common.form.pleaseInput')}
        onChange={(e) => onChange?.(e.target.value)}
        addonAfter={
          <IconButton
            className="px-3 py-1.5"
            onClick={() => ref.current?.click()}
          >
            <UploadOutlined />
          </IconButton>
        }
      />
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
          <div className="text-center mt-10">
            <Button
              onClick={() => {
                setCount(0)
                progressRef.current = 0
                isCloseRef.current = true
              }}
            >
              取消
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AliyunOSSUpload
