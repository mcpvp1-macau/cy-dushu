import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconMap from '@/assets/icons/jsx/IconMap'
import DynamicLayoutRoot, {
  type DynamicLayoutType,
} from '@/components/DynamicLayout'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useLocalStorageState } from 'ahooks'
import { useStore } from 'zustand'
import SmartCarControlRoomHeader from './components/SmartCarControlRoomHeader'
import SmartCarMap from './components/SmartCarMap'
import Select from '@/components/AntdOverride/Select'
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

  const toolsMap = useMemo(() => {
    const options = videoItems.map((item) => ({
      label: item.label,
      value: item.id,
    }))

    return {
      video: (
        <Select
          mode="multiple"
          size="small"
          value={selectedVideoIds}
          allowClear
          maxTagCount="responsive"
          className="min-w-[220px]"
          placeholder="选择视频"
          options={options}
          disabled={options.length === 0}
          // 业务规则：仅支持多选视频源，不自动排序用户选择顺序。
          onChange={(next) => setSelectedVideoIds(next)}
        />
      ),
    }
  }, [selectedVideoIds, videoItems])

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
