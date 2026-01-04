import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import Select from '@/components/AntdOverride/Select'
import DeviceLiveVideo from '@/components/VideoS/DeviceLiveVideo'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'

type SmartCarVideoItem = {
  id: string
  label: string
  deviceId: string
  productKey: string
  videoId: string
}

type PropsType = {
  dataDetail: API_DEVICE.domain.Device
}

/** 智慧警车视频 */
const SmartCarVideo: FC<PropsType> = memo(({ dataDetail }) => {
  const videoItems = useMemo<SmartCarVideoItem[]>(() => {
    // 业务规则：仅展示子设备中有视频源的摄像头。
    const items = dataDetail?.childDevice
      ?.map((item) => {
        const videoId = item?.properties?.videoList?.[0]?.videoId ?? 'live'
        const productKey = item?.productKey ?? item?.deviceModel?.productKey
        const deviceId = item?.deviceId

        if (!videoId || !productKey || !deviceId) {
          return null
        }

        return {
          id: `${deviceId}-${videoId}`,
          label: item?.name || item?.deviceName || deviceId,
          deviceId,
          productKey,
          videoId,
        }
      })
      .filter(Boolean)

    return (items ?? []) as SmartCarVideoItem[]
  }, [dataDetail?.childDevice])

  const [activeId, setActiveId] = useState('')
  const deviceRealtimeProperties = useGlobalWsStore(
    (state) => state.deviceRealtimeProperties,
  )

  useEffect(() => {
    if (!videoItems.length) {
      return
    }
    // 边界情况：视频列表变化时，确保默认选中首个可用视频源。
    if (!videoItems.some((item) => item.id === activeId)) {
      setActiveId(videoItems[0].id)
    }
  }, [activeId, videoItems])

  const activeVideo = useMemo(() => {
    // 优先从用户选择的 activeId 查找视频，如果找不到（比如列表变更后旧 id 失效），则自动回退到列表的第一个视频。
    return (
      videoItems.find((item) => item.id === activeId) ?? videoItems[0] ?? null
    )
  }, [activeId, videoItems])

  const switchItems = useMemo(
    () =>
      videoItems.map((item) => {
        // 业务规则：下拉项展示视频图标，并用徽标提示设备在线状态。
        const deviceStatus =
          deviceRealtimeProperties?.[item.deviceId]?.deviceStatus
        const isOnline = deviceStatus === 'ONLINE'

        return {
          label: (
            <div className="flex items-center gap-2">
              <div className="relative">
                <IconCameraVideo />
                <div
                  className={clsx(
                    'absolute -right-1.5 bottom-0.5 size-1.5 rounded-full',
                    isOnline ? 'bg-green-500' : 'bg-red-500',
                  )}
                />
              </div>
              <span>{item.label}</span>
            </div>
          ),
          value: item.id,
        }
      }),
    [deviceRealtimeProperties, videoItems],
  )

  if (!activeVideo) {
    return null
  }

  return (
    <section className="mx-3 mb-3 rounded overflow-hidden">
      <DeviceLiveVideo
        deviceId={activeVideo.deviceId}
        productKey={activeVideo.productKey}
        videoId={activeVideo.videoId}
        leftTop={
          switchItems.length > 1 ? (
            <Select
              size="small"
              value={activeId}
              options={switchItems}
              className="[&_.ant-select-selector]:!pl-0"
              variant="borderless"
              popupMatchSelectWidth={false}
              // 业务规则：切换下拉仅用于切换视频源。
              onChange={setActiveId}
            />
          ) : null
        }
      />
    </section>
  )
})

SmartCarVideo.displayName = 'SmartCarVideo'

export default SmartCarVideo
