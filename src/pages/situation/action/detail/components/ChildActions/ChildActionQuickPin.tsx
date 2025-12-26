import IconDing from '@/assets/icons/jsx/IconDing'
import IconButton from '@/components/ui/button/IconButton'
import { DeviceEnum } from '@/enum/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import { getDeviceDetail } from '@/service/modules/device'
import useFixedWindowsStore from '@/store/useFixedWindows.store'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  actionItems: API_ACTION_ITEM.domain.ActionItem[]
}

const cameraDeviceTypes = new Set<string>([
  DeviceEnum.CAMERA,
  DeviceEnum.VISIBLE_LIGHT_CAMERA,
  DeviceEnum.INFRARED_CAMERA,
])

const ChildActionQuickPin: FC<PropsType> = memo(({ actionItems }) => {
  const { t } = useTranslation()
  const addWindow = useFixedWindowsStore((s) => s.addWindow)
  const msgApi = useAppMsg()

  const [loading, setLoading] = useState(false)

  const handlePin = useMemoizedFn(async () => {
    if (loading) {
      return
    }

    const deviceIdSet = new Set(
      actionItems
        .flatMap((item) => item.deviceId?.split(',') ?? [])
        .map((deviceId) => deviceId.trim())
        .filter(Boolean),
    )

    if (!deviceIdSet.size) {
      msgApi.warning(
        t('action.detail.task.quickPinNoDevice', {
          defaultValue: '暂无可钉出设备',
        }),
      )
      return
    }

    setLoading(true)
    try {
      let pinnedCount = 0
      let hasVideoMissing = false

      // 业务规则：逐个拉取设备详情，避免并发过多导致接口抖动
      for (const deviceId of deviceIdSet) {
        try {
          const resp = await getDeviceDetail(deviceId)
          const deviceDetail = resp?.data
          if (!deviceDetail) {
            continue
          }

          const isCamera = cameraDeviceTypes.has(deviceDetail.deviceType ?? '')
          if (isCamera) {
            const detailDeviceId = deviceDetail.deviceId
            const productKey =
              deviceDetail.productKey || deviceDetail.deviceModel?.productKey
            const videoId = deviceDetail?.properties?.videoList?.[0]?.videoId

            // 业务规则：摄像头优先钉出视频，缺失关键参数时跳过
            if (!detailDeviceId || !productKey || !videoId) {
              hasVideoMissing = true
              continue
            }

            addWindow({
              params: {
                type: 'live-video',
                productKey,
                deviceId: detailDeviceId,
                videoId,
              },
              allowScale: true,
              layout: {
                x: document.body.clientWidth / 2 - 200,
                y: document.body.clientHeight / 2 - 150,
                width: 320 + 2,
                height: 320 * (9 / 16) + 32 + 2,
              },
            })
            pinnedCount += 1
            continue
          }

          if (!deviceDetail.deviceId) {
            continue
          }

          // 业务规则：非摄像头统一钉出设备详情
          addWindow({
            params: {
              type: 'device-detail',
              deviceId: deviceDetail.deviceId,
            },
            layout: {
              x: document.body.clientWidth / 2 - 176,
              y: 52,
              width: 352,
              height: 600,
            },
          })
          pinnedCount += 1
        } catch (error) {
          // 边界情况：单个设备异常不影响其他设备继续钉出
          console.warn('Quick pin device failed', deviceId, error)
        }
      }

      if (pinnedCount === 0) {
        const messageKey = hasVideoMissing
          ? 'action.detail.task.quickPinVideoEmpty'
          : 'action.detail.task.quickPinNoDevice'
        const defaultValue = hasVideoMissing
          ? '暂无可用视频'
          : '暂无可钉出设备'
        msgApi.warning(t(messageKey, { defaultValue }))
      }
    } finally {
      setLoading(false)
    }
  })

  return (
    <IconButton
      disabled={loading}
      tippyProps={{
        content: t('action.detail.task.quickPin', {
          defaultValue: '一键钉出',
        }),
      }}
      onClick={handlePin}
    >
      {loading ? <LoadingOutlined /> : <IconDing className="scale-90" />}
    </IconButton>
  )
})

ChildActionQuickPin.displayName = 'ChildActionQuickPin'

export default ChildActionQuickPin
