import { uploadSystemTutorial } from '@/service/modules/system-config'
import { InboxOutlined } from '@ant-design/icons'
import { UploadFile } from 'antd'
import Dragger from 'antd/es/upload/Dragger'

type PropsType = unknown

const PageDocumentsUpload: FC<PropsType> = memo(() => {
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const queryClient = useQueryClient()

  const uploadFile = async (file: UploadFile) => {
    setFileList((list) =>
      list.map((f) =>
        f.uid === file.uid ? { ...f, status: 'uploading', percent: 0 } : f,
      ),
    )
    const resp = await uploadSystemTutorial(file.originFileObj as File)

    const reader = resp.body?.getReader()
    if (!reader) {
      return
    }
    let done = false
    const decoder = new TextDecoder()
    while (!done) {
      const { done: innerDone, value } = await reader.read()
      done = innerDone
      if (done) {
        setFileList((list) =>
          list.map((f) =>
            f.uid === file.uid ? { ...f, percent: 100, status: 'done' } : f,
          ),
        )
        break
      }
      // 处理读取到的数据
      const text = decoder.decode(value)
      if (text.startsWith('progress')) {
        const percent = Number(text.split(' ')[1]) * 100
        setFileList((list) =>
          list.map((f) =>
            f.uid === file.uid ? { ...f, status: 'uploading', percent } : f,
          ),
        )
      } else if (text === 'done') {
        setFileList((list) =>
          list.map((f) =>
            f.uid === file.uid ? { ...f, percent: 100, status: 'done' } : f,
          ),
        )
        break
      } else {
        setFileList((list) =>
          list.map((f) => (f.uid === file.uid ? { ...f, status: 'error' } : f)),
        )
      }
    }
    queryClient.invalidateQueries({ queryKey: ['getTutorials'] })
  }

  console.log('fileList', fileList)

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-[400px]">
        <Dragger
          accept=".pdf,.mp4"
          beforeUpload={() => false}
          fileList={fileList}
          onChange={({ fileList }) => {
            setFileList(fileList)
            for (const file of fileList) {
              if (file.status !== undefined) {
                continue
              }
              uploadFile(file)
            }
          }}
          multiple={true}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from
            uploading company data or other banned files.
          </p>
        </Dragger>
      </div>
    </div>
  )
})

PageDocumentsUpload.displayName = 'PageDocumentsUpload'

export default PageDocumentsUpload
