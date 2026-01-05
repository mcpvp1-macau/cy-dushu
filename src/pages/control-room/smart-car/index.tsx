import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconMap from '@/assets/icons/jsx/IconMap'
import DynamicLayoutRoot, {
  type DynamicLayoutType,
} from '@/components/DynamicLayout'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { useLocalStorageState } from 'ahooks'
import { useStore } from 'zustand'
import SmartCarControlRoomHeader from './components/SmartCarControlRoomHeader'
import SmartCarMap from './components/SmartCarMap'
import SmartCarVideoSelector from './components/SmartCarVideoSelector'
import SmartCarVideoWall from './components/SmartCarVideoWall'
import { useSmartCarVideoSelection } from './hooks/useSmartCarVideoSelection'

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

  const {
    videoItems,
    selectedVideoIds,
    handleSelectedChange,
    videoMenuItems,
    isVideoMenuOpen,
    handleVideoMenuOpenChange,
  } = useSmartCarVideoSelection({
    deviceDetail,
    deviceRealtimeProperties,
  })

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
              onSelectedChange={handleSelectedChange}
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
    return {
      video: (
        <SmartCarVideoSelector
          menuItems={videoMenuItems}
          open={isVideoMenuOpen}
          onOpenChange={handleVideoMenuOpenChange}
        />
      ),
    }
  }, [
    handleVideoMenuOpenChange,
    isVideoMenuOpen,
    videoMenuItems,
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
