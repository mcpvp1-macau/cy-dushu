import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconMap from '@/assets/icons/jsx/IconMap'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import DynamicLayoutRoot, {
  type DynamicLayoutType,
} from '@/components/DynamicLayout'
import IconButton from '@/components/ui/button/IconButton'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { Dropdown, type MenuProps } from 'antd'
import { useLocalStorageState } from 'ahooks'
import { useStore } from 'zustand'
import SmartCarControlRoomHeader from './components/SmartCarControlRoomHeader'
import SmartCarMap from './components/SmartCarMap'
import SmartCarVideoWall, {
  type SmartCarVideoItem,
} from './components/SmartCarVideoWall'

const initialLayout: DynamicLayoutType = {
  type: 'row',
  size: 1,
  children: [
    {
      type: 'tabs',
      size: 700,
      children: [
        {
          key: 'map',
        },
      ],
    },
    {
      type: 'tabs',
      size: 600,
      children: [
        {
          key: 'video',
        },
      ],
    },
  ],
}

const PageControlRoomSmartCar: FC = memo(() => {
  const { deviceId = '' } = useParams()

  const { store } = useCreateDeviceDetailStore(deviceId)
  const deviceDetail = useStore(store, (s) => s.deviceDetail)
  const deviceRealtimeProperties = useGlobalWsStore(
    (state) => state.deviceRealtimeProperties,
  )

  const videoItems = useMemo<SmartCarVideoItem[]>(() => {
    // 业务规则：仅展示子设备中有视频源的摄像头。
    const items = deviceDetail?.childDevice
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
  }, [deviceDetail?.childDevice])

  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([])

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

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'smartCarControlRoomLayout',
    {
      defaultValue: initialLayout,
    },
  )

  const iconMap = useMemo(
    () => ({
      map: <IconMap className="text-blue-500" />,
      video: <IconCameraVideo className="text-blue-500" />,
    }),
    [],
  )

  const titleMap = useMemo(
    () => ({
      map: '地图',
      video: '视频',
    }),
    [],
  )

  const componentMap = useMemo(
    () => ({
      map: <SmartCarMap />,
      video: (
        <div className="size-full overflow-auto">
          {/* 边界情况：设备详情未就绪时隐藏视频区域内容。 */}
          {deviceDetail ? (
            <SmartCarVideoWall
              videoItems={videoItems}
              selectedIds={selectedVideoIds}
              onSelectedChange={setSelectedVideoIds}
            />
          ) : (
            <div className="p-3 text-sm text-fore-2">暂无视频</div>
          )}
        </div>
      ),
    }),
    [deviceDetail, selectedVideoIds, videoItems],
  )

  const toggleVideoSelection = useMemoizedFn((videoId: string) => {
    setSelectedVideoIds((prev) => {
      if (prev.includes(videoId)) {
        return prev.filter((id) => id !== videoId)
      }
      // 业务规则：按用户选择顺序追加，避免自动排序。
      return [...prev, videoId]
    })
  })

  const toolsMap = useMemo(() => {
    const menuItems: MenuProps['items'] = videoItems.map((item) => {
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

    return {
      video: (
        <div
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <Dropdown
            trigger={['click']}
            disabled={menuItems.length === 0}
            menu={{
              items: menuItems,
            }}
          >
            <IconButton className="text-blue-500">
              <IconCameraVideo />
            </IconButton>
          </Dropdown>
        </div>
      ),
    }
  }, [
    deviceRealtimeProperties,
    selectedVideoIds,
    toggleVideoSelection,
    videoItems,
  ])

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <div className="page-full flex flex-col">
        <SmartCarControlRoomHeader />
        <main className="grow w-full relative overflow-hidden">
          <DynamicLayoutRoot
            layout={layout!}
            onLayoutChange={setLayout}
            iconMap={iconMap}
            titleMap={titleMap}
            toolsMap={toolsMap}
            componentMap={componentMap}
          />
        </main>
      </div>
    </DeviceDetailStoreContext.Provider>
  )
})

PageControlRoomSmartCar.displayName = 'PageControlRoomSmartCar'

export default PageControlRoomSmartCar
