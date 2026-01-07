import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import type { MenuProps } from 'antd'
import type { SmartCarVideoItem } from '../components/SmartCarVideoWall'

type UseSmartCarVideoSelectionParams = {
  deviceDetail?: API_DEVICE.domain.Device | null
  deviceRealtimeProperties?: Record<string, { deviceStatus?: string }>
}

type UseSmartCarVideoSelectionResult = {
  videoItems: SmartCarVideoItem[]
  selectedVideoIds: string[]
  handleSelectedChange: (nextIds: string[]) => void
  isAllVideoSelected: boolean
  toggleAllVideoSelection: () => void
  videoMenuItems: MenuProps['items']
  isVideoMenuOpen: boolean
  handleVideoMenuOpenChange: (
    open: boolean,
    info?: { source?: 'trigger' | 'menu' },
  ) => void
}

const getDeviceVideoItems = (
  childDevices: API_DEVICE.domain.Device[] = [],
) => {
  return childDevices
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
    .filter(Boolean) as SmartCarVideoItem[]
}

export const useSmartCarVideoSelection = (
  params: UseSmartCarVideoSelectionParams,
): UseSmartCarVideoSelectionResult => {
  const { deviceDetail, deviceRealtimeProperties } = params

  const sortedChildDevices = useMemo(() => {
    const childDevices = deviceDetail?.childDevice ?? []
    // 业务规则：云台设备需要排在子设备列表最前面，确保优先展示。
    return [...childDevices].sort((prev, next) => {
      const isPrevGimbal = prev?.deviceType === 'SMART_CAR_GIMBAL'
      const isNextGimbal = next?.deviceType === 'SMART_CAR_GIMBAL'

      if (isPrevGimbal === isNextGimbal) {
        return 0
      }

      return isPrevGimbal ? -1 : 1
    })
  }, [deviceDetail?.childDevice])

  const videoItems = useMemo<SmartCarVideoItem[]>(() => {
    // 业务规则：仅展示子设备中有视频源的摄像头。
    return getDeviceVideoItems(sortedChildDevices)
  }, [sortedChildDevices])

  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([])
  const [isVideoMenuOpen, setIsVideoMenuOpen] = useState(false)

  useEffect(() => {
    const availableIds = videoItems.map((item) => item.id)
    setSelectedVideoIds((prev) => {
      const next = prev.filter((id) => availableIds.includes(id))
      if (next.length > 0) {
        return next
      }
      // 边界情况：首次进入或视频列表变化时，自动补齐默认选择。
      return availableIds.length > 0 ? [availableIds[0]] : []
    })
  }, [videoItems])

  const handleSelectedChange = useMemoizedFn((nextIds: string[]) => {
    setSelectedVideoIds(nextIds)
  })

  const allVideoIds = useMemo(() => {
    return videoItems.map((item) => item.id)
  }, [videoItems])

  const isAllVideoSelected = useMemo(() => {
    if (allVideoIds.length === 0) {
      return false
    }

    return allVideoIds.every((id) => selectedVideoIds.includes(id))
  }, [allVideoIds, selectedVideoIds])

  const toggleAllVideoSelection = useMemoizedFn(() => {
    if (!allVideoIds.length) {
      return
    }

    setSelectedVideoIds((prev) => {
      const isAllSelected = allVideoIds.every((id) => prev.includes(id))
      // 业务规则：一键切换时按列表顺序全选，或清空已选。
      return isAllSelected ? [] : [...allVideoIds]
    })
  })

  const toggleVideoSelection = useMemoizedFn((videoId: string) => {
    setSelectedVideoIds((prev) => {
      if (prev.includes(videoId)) {
        return prev.filter((id) => id !== videoId)
      }
      // 业务规则：按用户选择顺序追加，避免自动排序。
      return [...prev, videoId]
    })
  })

  const handleVideoMenuOpenChange = useMemoizedFn(
    (open: boolean, info?: { source?: 'trigger' | 'menu' }) => {
      if (info?.source === 'menu' && !open) {
        // 边界情况：点击菜单项会触发关闭，这里保持展开，直到点击外部区域。
        setIsVideoMenuOpen(true)
        return
      }

      setIsVideoMenuOpen(open)
    },
  )

  const videoMenuItems = useMemo<MenuProps['items']>(() => {
    return videoItems.map((item) => {
      // 业务规则：下拉项展示视频图标，并用徽标提示设备在线状态。
      const deviceStatus =
        deviceRealtimeProperties?.[item.deviceId]?.deviceStatus
      const isOnline = deviceStatus === 'ONLINE'
      const isSelected = selectedVideoIds.includes(item.id)

      return {
        key: item.id,
        label: (
          <div className="flex items-center justify-between gap-3">
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
            {isSelected ? <IconVisible /> : <IconNotVisible />}
          </div>
        ),
        // 业务规则：通过点击菜单项切换选中状态。
        onClick: () => toggleVideoSelection(item.id),
      }
    })
  }, [deviceRealtimeProperties, selectedVideoIds, toggleVideoSelection, videoItems])

  return {
    videoItems,
    selectedVideoIds,
    handleSelectedChange,
    isAllVideoSelected,
    toggleAllVideoSelection,
    videoMenuItems,
    isVideoMenuOpen,
    handleVideoMenuOpenChange,
  }
}
