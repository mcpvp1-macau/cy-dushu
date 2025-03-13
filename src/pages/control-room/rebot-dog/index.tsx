import DeviceIconRebotDog from '@/assets/icons/jsx/device/DeviceIconRebotDog'
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
          key: 'device-data',
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
  )

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'rebotDogControlRoomLayout',
    {
      defaultValue: initialLayout,
    },
  )

  const iconMap = useMemo(
    () => ({
      map: <IconMap className="text-blue-500" />,
      video: <IconCameraVideo className="text-blue-500" />,
      control: <IconFlightOperation className="text-orange-500" />,
      buttons: <DeviceIconRebotDog className="text-purple-500" />,
      'device-data': <IconDeviceData className="text-orange-500" />,
      params: <IconDeviceData className="text-orange-500" />,
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
    }),
    [t],
  )

  const componentMap = useMemo(
    () => ({
      map: <RebotDogMap />,
      video: <RebotDogVideo />,
      control: (
        <div className="absolute inset-0 flex justify-center scale-90">
          <RebotDogControlButtons />
        </div>
      ),
      buttons: <RebotDogAsideButtons />,
      'device-data': <RebotDogDetailData />,
      params: <RebotDogParams />,
    }),
    [],
  )

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <RebotDogControlRoomStoreContext.Provider value={controlRoomStore}>
        <div className="flex flex-col page-full">
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
