import IconSnapshot from '@/assets/icons/jsx/IconSnapshot'
import IconButton from '@/components/ui/button/IconButton'
import { memo, RefObject, type FC } from 'react'
import { useAppMsg } from '../useAppMsg'
import { uploadPic } from '@/service/modules/device'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  productKey: string
  deviceId: string
  videoLiveRef: RefObject<{
    snapshot: (mediaTypes?: string, quality?: any) => string
  }>
}

/** 视频截图按钮 */
const VideoSnapshotBtn: FC<PropsType> = memo(
  ({ productKey, deviceId, videoLiveRef }) => {
    const msgApi = useAppMsg()
    const [loading, setLoading] = useState(false)

    /** 截图 */
    const handleSnapshot = async () => {
      setLoading(true)
      try {
        const base64 = videoLiveRef?.current?.snapshot()
        const idx = base64?.indexOf('base64,') ?? -1
        if (idx > -1) {
          const data = base64!.substring(idx + 'base64,'.length)
          await uploadPic(productKey, deviceId, { imgData: data! })
          msgApi.success('截图成功')
        }
      } finally {
        setLoading(false)
      }
    }

    return (
      <IconButton toolTipProps={{ title: '截图' }} onClick={handleSnapshot}>
        {!loading ? <IconSnapshot /> : <LoadingOutlined />}
      </IconButton>
    )
  },
)

VideoSnapshotBtn.displayName = 'VideoSnapshotBtn'

export default VideoSnapshotBtn
