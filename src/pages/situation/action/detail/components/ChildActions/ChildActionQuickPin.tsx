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

const layoutBase = {
  x: 377,
  y: 12,
  gap: 12,
}

const cameraLayoutSize = {
  width: 320 + 2,
  height: 320 * (9 / 16) + 32 + 2,
}

const deviceLayoutSize = {
  width: 352,
  height: 600,
}

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
      const cameraItems: {
        deviceId: string
        productKey: string
        videoId: string
      }[] = []
      const deviceItems: { deviceId: string }[] = []

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

            cameraItems.push({
              deviceId: detailDeviceId,
              productKey,
              videoId,
            })
            continue
          }

          if (!deviceDetail.deviceId) {
            continue
          }

          // 业务规则：非摄像头统一钉出设备详情
          deviceItems.push({ deviceId: deviceDetail.deviceId })
        } catch (error) {
          // 边界情况：单个设备异常不影响其他设备继续钉出
          console.warn('Quick pin device failed', deviceId, error)
        }
      }

      // 业务规则：摄像头类优先钉出，其次才是其他设备
      const pinQueue = [
        ...cameraItems.map((item) => ({
          key: item.deviceId,
          type: 'camera' as const,
          payload: item,
          layoutSize: cameraLayoutSize,
        })),
        ...deviceItems.map((item) => ({
          key: item.deviceId,
          type: 'device' as const,
          payload: item,
          layoutSize: deviceLayoutSize,
        })),
      ]

      if (pinQueue.length > 0) {
        let currentX = layoutBase.x
        let currentY = layoutBase.y
        let columnWidth = 0

        const maxHeight = window.innerHeight - layoutBase.gap

        for (const item of pinQueue) {
          const nextBottom = currentY + item.layoutSize.height
          // 边界情况：当前列高度不足时换列
          const shouldWrap =
            nextBottom > maxHeight && currentY !== layoutBase.y

          if (shouldWrap) {
            currentX += columnWidth + layoutBase.gap
            currentY = layoutBase.y
            columnWidth = 0
          }

          if (item.type === 'camera') {
            addWindow({
              params: {
                type: 'live-video',
                productKey: item.payload.productKey,
                deviceId: item.payload.deviceId,
                videoId: item.payload.videoId,
              },
              allowScale: true,
              layout: {
                x: currentX,
                y: currentY,
                ...item.layoutSize,
              },
            })
          } else {
            addWindow({
              params: {
                type: 'device-detail',
                deviceId: item.payload.deviceId,
              },
              layout: {
                x: currentX,
                y: currentY,
                ...item.layoutSize,
              },
            })
          }

          pinnedCount += 1
          currentY += item.layoutSize.height + layoutBase.gap
          columnWidth = Math.max(columnWidth, item.layoutSize.width)
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
