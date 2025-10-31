import ControlRoomUavHeader from './components/Header'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import {
  UavControlRoomStoreContext,
  useCreateUavControlRoomStore,
} from '@/store/context-store/useUavControlRoom.store'
import { useStore } from 'zustand'
import AsideToolBar from './components/AsideToolBar'
import ControlRoomUavCameraSwitch from './components/CameraSwitch'
import FallbackMessage from './components/FallbackMessage'
import ControlCMDSender from './components/ControlCMDSender'
import Zoom from './components/Zoom'
import useServerEventMsg from './hooks/useServerEventMsg'
import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconMap from '@/assets/icons/jsx/IconMap'
import IconAISwitch from '@/assets/icons/jsx/IconAISwitch'
import { DeviceEnum } from '@/enum/device'
import StateResolver from './components/StateResolver'
import DynamicLayoutRoot from '@/components/DynamicLayout'
import { ScrollArea } from '@/components/ui/scroll-area'
import GimbalLeft from './components/GimbalLeft'
import IconPayload from '@/assets/icons/jsx/IconPayload'
import IconFlightParams from '@/assets/icons/jsx/uav/IconFlightParams'
import IconDeviceData from '@/assets/icons/jsx/IconDeviceData'
import IconFlightOperation from '@/assets/icons/jsx/uav/IconFlightOperation'
import { useUavControlRoomLayoutStore } from './hooks/useUavControlRoomLayout.store'
import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import useControlRoomTargetInfoStore from '@/store/control-room/useTargetInfo.store'
import { useLocation } from 'react-router'
import InitialPointFly from './components/InitialPointFly'
import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import IconControl from '@/assets/icons/jsx/IconControl'
import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'
import DeferredRender from '@/components/DeferredRender'
import { useListenRealProcessedResults } from '@/store/map/useReconstruction2DMap.store'
import { lazy } from 'react'
import ParentVideoAlert from './components/ParentVideoAlert'
import { useListenDeviceLatestTask } from '@/store/useDeviceLatestTask.store'

const ControlRoomUavMap = lazy(() => import('./components/ControlRoomMap'))
const DitingTanqi = lazy(() => import('./components/DitingTanqi/DitingTanqi'))
const ControlRoomVideo = lazy(() => import('./components/ControlRoomVideo'))
const RightOverlayDetail = lazy(
  () => import('./components/right_detail/Overlay'),
)
const DeviceAlgorithmList = lazy(
  () => import('@/components/device/algorithm/DeviceAlgorithmList'),
)
const UavDetailData = lazy(
  () => import('@/pages/right/DeviceDetail/UavDetail/components/UavDetailData'),
)
const AsideButtons = lazy(() => import('./components/AsideButtons'))
const BottomButtons = lazy(() => import('./components/BottomButtons'))
const UavPayload = lazy(() => import('./components/Payload'))
const ControlRoomEventDetail = lazy(() => import('./components/EventDetail'))
const FlyParamsSetting = lazy(() => import('./components/FlyParamsSetting'))
const ControlParamsSetting = lazy(
  () => import('./components/ControlParamsSetting'),
)

type PropsType = unknown

const PageControlRoomUav: FC<PropsType> = memo(() => {
  const deviceId = useParams().deviceId!
  const { store } = useCreateDeviceDetailStore(deviceId)
  const productKey = useStore(
    store,
    (s) =>
      (s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey)!,
  )

  const handleServerEvtMsg = useServerEventMsg()

  const updateTargets = useControlRoomTargetInfoStore((s) => s.updateTargets)
  const controlRoomStore = useCreateUavControlRoomStore(
    productKey!,
    deviceId,
    (wsData) => {
      handleServerEvtMsg(wsData)
      if (wsData.method === 'event.targetInfo.info') {
        updateTargets(wsData.data?.targets ?? [])
      }
    },
  )

  const layout = useUavControlRoomLayoutStore((s) => s.layout)
  const updateLayout = useUavControlRoomLayoutStore((s) => s.updateLayout)

  const { t } = useTranslation()
  const iconMap = useMemo(
    () => ({
      map: <IconMap className="text-blue-500" />,
      video: <IconCameraVideo className="text-blue-500" />,
      flyParams: <IconFlightOperation className="text-orange-500" />,
      controlParamsSetting: <IconFlightParams className="text-emerald-500" />,
      flyButtons: <IconControl className="text-purple-500" />,
      flyParamsSetting: <IconFlightParams className="text-emerald-500" />,
      payload: <IconPayload className="text-emerald-500" />,
      'ai-list': <IconAISwitch className="text-violet-500" />,
      'device-data': <IconDeviceData className="text-orange-500" />,
      overlay: <IconDrawArea className="text-blue-500" />,
      tanqi: <IconTanQi className="text-emerald-500" />,
      event: <MenuIconEvents className="text-[#ae706e]" />,
    }),
    [],
  )

  const titleMap = useMemo(
    () => ({
      map: t('common.map'),
      video: t('common.video'),
      flyParams: t('controlRoom.uav.flyParams.title'),
      controlParamsSetting: t('common.params'),
      flyButtons: t('controlRoom.uav.flyButtons.title'),
      flyParamsSetting: t('common.params'),
      payload: t('controlRoom.uav.payload.title'),
      ['ai-list']: t('controlRoom.uav.aiList.title'),
      ['device-data']: t('controlRoom.uav.deviceData.title'),
      overlay: t('controlRoom.uav.overlay.title'),
      tanqi: t('common.tanqi'),
      event: t('common.event'),
    }),
    [t],
  )

  const componentMap = useMemo(
    () => ({
      map: (
        <DeferredRender>
          <ControlRoomUavMap />
        </DeferredRender>
      ),
      video: (
        <div className="size-full relative">
          <ControlRoomVideo />
          <aside className="absolute top-3 left-3 flex gap-3 items-center z-50">
            <ControlRoomUavCameraSwitch />
            <FallbackMessage />
          </aside>
          <GimbalLeft />
          <Zoom />
        </div>
      ),
      flyParams: (
        <div className="absolute inset-0 flex justify-center scale-90">
          <BottomButtons />
        </div>
      ),
      controlParamsSetting: <ControlParamsSetting />,
      flyParamsSetting: (
        <div className="size-full overflow-hidden flex flex-col">
          <ScrollArea>
            <FlyParamsSetting />
          </ScrollArea>
        </div>
      ),
      payload: <UavPayload productKey={productKey} />,
      ['device-data']: <UavDetailData />,
      flyButtons: (
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-full max-w-[520px] min-w-[300px] px-2 flex flex-col gap-2.5">
            <AsideToolBar />
            <AsideButtons />
          </div>
        </div>
      ),
      ['ai-list']: (
        <div className="size-full text-sm overflow-hidden flex flex-col">
          <DeviceAlgorithmList
            productKey={productKey}
            deviceId={deviceId}
            deviceType={DeviceEnum.UAV}
          />
        </div>
      ),
      overlay: <RightOverlayDetail />,
      tanqi: <DitingTanqi />,
      event: <ControlRoomEventDetail />,
    }),
    [productKey, deviceId],
  )

  const { pathname } = useLocation()

  useListenRealProcessedResults((id) => id === deviceId)
  useListenDeviceLatestTask(deviceId)

  return (
    <DeviceDetailStoreContext.Provider key={deviceId} value={store}>
      <UavControlRoomStoreContext.Provider value={controlRoomStore}>
        <StateResolver />
        <InitialPointFly />
        <div
          className={clsx(
            'flex flex-col',
            pathname.startsWith('/share/') ? 'w-screen h-screen' : 'page-full',
          )}
        >
          <ControlRoomUavHeader />
          <main className="grow w-full relative overflow-hidden">
            <DynamicLayoutRoot
              layout={layout!}
              onLayoutChange={updateLayout}
              iconMap={iconMap}
              titleMap={titleMap}
              componentMap={componentMap}
            />
          </main>
        </div>
        <ControlCMDSender />
        <ParentVideoAlert />
      </UavControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
})

PageControlRoomUav.displayName = 'ControlRoomUav'

export default PageControlRoomUav
