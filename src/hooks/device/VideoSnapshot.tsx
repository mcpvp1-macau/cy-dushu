import IconSnapshot from '@/assets/icons/jsx/IconSnapshot'
import IconButton from '@/components/ui/button/IconButton'
import { memo, RefObject, type FC } from 'react'
import { useAppMsg } from '../useAppMsg'
import { uploadPic } from '@/service/modules/device'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  productKey: string
  deviceId: string
  disabled?: boolean
  videoLiveRef: RefObject<{
    snapshot: (mediaTypes?: string, quality?: any) => string
  }>
}

/** 视频截图按钮 */
const VideoSnapshotBtn: FC<PropsType> = memo(
  ({ productKey, deviceId, disabled, videoLiveRef }) => {
    const msgApi = useAppMsg()
    const [loading, setLoading] = useState(false)

    const { t } = useTranslation()

    /** 截图 */
    const handleSnapshot = async () => {
      setLoading(true)
      try {
        const base64 = videoLiveRef?.current?.snapshot()
        const idx = base64?.indexOf('base64,') ?? -1
        if (idx > -1) {
          const data = base64!.substring(idx + 'base64,'.length)
          await uploadPic(productKey, deviceId, { imgData: data! })
          msgApi.success(t('screenshot.screenshotSuccess'))
        }
      } finally {
        setLoading(false)
      }
    }

    return (
      <IconButton
        tippyProps={{ content: t('common.screenShot') }}
        onClick={handleSnapshot}
        disabled={disabled}
      >
        {!loading ? <IconSnapshot /> : <LoadingOutlined />}
      </IconButton>
    )
  },
)

VideoSnapshotBtn.displayName = 'VideoSnapshotBtn'

export default VideoSnapshotBtn
