import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconDeviceData from '@/assets/icons/jsx/IconDeviceData'
import IconMap from '@/assets/icons/jsx/IconMap'
import IconFlightOperation from '@/assets/icons/jsx/uav/IconFlightOperation'
import DynamicLayoutRoot, {
  DynamicLayoutType,
} from '@/components/DynamicLayout'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import {
  RebotDogControlRoomStoreContext,
  useCreateRebotDogControlRoomStore,
} from '@/store/context-store/useRebotDogControlRoom.store'
import { useLocalStorageState } from 'ahooks'
import { useStore } from 'zustand'
import RebotDogMap from './components/Map'
import RebotDogVideo from './components/Video'
import RebotDogDetailData from '@/pages/right/DeviceDetail/RebotDogDetail/components/Data'
import RebotDogAsideButtons from './components/AsideButtons'
import RebotDogControlButtons from './components/ControlButtons'
import ControlCMDSender from './components/ControlCMDSender'
import RebotDogParams from './components/Params'
import IconControlParams from '@/assets/icons/jsx/IconControlParams'
import IconControl from '@/assets/icons/jsx/IconControl'
import ControlRoomRebotDogHeader from './components/Header'
import IconPayload from '@/assets/icons/jsx/IconPayload'
import RebotDogPayload from './components/Payload'
import PointCloudMapManager from './components/PointCloudMapManager'
import useServerEventMsg from '../uav/hooks/useServerEventMsg'
import { useListenDeviceLatestTask } from '@/store/useDeviceLatestTask.store'

const initialLayout: DynamicLayoutType = {
  type: 'row',
  size: 1,
  children: [
    {
      type: 'tabs',
      size: 600,
      children: [
        {
          key: 'map',
        },
      ],
    },
    {
      type: 'col',
      size: 800,
      children: [
        {
          type: 'tabs',
          size: 3,
          children: [
            {
              key: 'video',
            },
          ],
        },
        {
          type: 'row',
          size: 1,
          children: [
            {
              type: 'tabs',
              size: 3,
              children: [
                {
                  key: 'control',
                },
              ],
            },
            {
              type: 'tabs',
              size: 3,
              children: [
                {
                  key: 'buttons',
                },
                {
                  key: 'params',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'tabs',
      size: 350,
      isCollapsed: true,
      children: [
        {
          key: 'payload',
        },
        {
          key: 'device-data',
        },
        {
          key: 'point-cloud-map-manager',
        },
      ],
    },
  ],
}

const PageControlRoomRebotDog: FC<unknown> = memo(() => {
  const { t } = useTranslation()

  const deviceId = useParams().deviceId!
  const { store } = useCreateDeviceDetailStore(deviceId)
  const productKey = useStore(
    store,
    (s) =>
      (s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey)!,
  )
  const controlRoomStore = useCreateRebotDogControlRoomStore(
    productKey,
    deviceId,
    useServerEventMsg(),
  )

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'rebotDogControlRoomLayoutV3',
    {
      defaultValue: initialLayout,
    },
  )

  const iconMap = useMemo(
    () => ({
      map: <IconMap className="text-blue-500" />,
      video: <IconCameraVideo className="text-blue-500" />,
      control: <IconFlightOperation className="text-orange-500" />,
      buttons: <IconControl className="text-purple-500" />,
      'device-data': <IconDeviceData className="text-orange-500" />,
      params: <IconControlParams className="text-orange-500" />,
      payload: <IconPayload className="text-emerald-500" />,
      'point-cloud-map-manager': <IconPayload className="text-emerald-500" />,
    }),
    [],
  )

  const titleMap = useMemo(
    () => ({
      map: t('common.map'),
      video: t('common.video'),
      control: t('controlRoom.uav.flyParams.title'),
      buttons: t('controlRoom.uav.flyButtons.title'),
      ['device-data']: t('controlRoom.uav.deviceData.title'),
      params: t('common.params'),
      payload: t('controlRoom.uav.payload.title'),
      'point-cloud-map-manager': '地图',
    }),
    [t],
  )

  const componentMap = useMemo(
    () => ({
      map: <RebotDogMap />,
      // map: <div>123</div>,
      video: <RebotDogVideo />,
      control: (
        <div className="absolute inset-0 flex justify-center scale-90">
          <RebotDogControlButtons />
        </div>
      ),
      buttons: <RebotDogAsideButtons />,
      'device-data': <RebotDogDetailData />,
      params: <RebotDogParams />,
      payload: <RebotDogPayload />,
      'point-cloud-map-manager': <PointCloudMapManager />,
    }),
    [],
  )

  useListenDeviceLatestTask(deviceId)

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <RebotDogControlRoomStoreContext.Provider value={controlRoomStore}>
        <div className="flex flex-col page-full">
          <ControlRoomRebotDogHeader />
          <main className="grow w-full relative overflow-hidden">
            <DynamicLayoutRoot
              layout={layout!}
              onLayoutChange={setLayout}
              iconMap={iconMap}
              titleMap={titleMap}
              componentMap={componentMap}
            />
          </main>
        </div>
        <ControlCMDSender />
      </RebotDogControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
})

PageControlRoomRebotDog.displayName = 'PageControlRoomRebotDog'

export default PageControlRoomRebotDog
