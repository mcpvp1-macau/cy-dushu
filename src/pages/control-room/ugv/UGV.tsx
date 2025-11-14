import ControlRoomUGVHeader from './components/Header'
import ControlRoomUGVMap from './components/Map'
import ControlRoomUGVVideo from './components/Video'
import ControlRoomUGVSpeedParams from './components/SpeedParams'
import ControlRoomUGVKeyHints from './components/KeyHints'
import ControlRoomUGVCmdSender from './components/ControlCMDSender'
import UGVControlRuntime from './components/MovementRuntime'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import {
  UGVControlRoomStoreContext,
  useCreateUGVControlRoomStore,
} from '@/store/context-store/useUGVControlRoom.store'
import { useStore } from 'zustand'
import useServerEventMsg from '../uav/hooks/useServerEventMsg'
import { useListenDeviceLatestTask } from '@/store/useDeviceLatestTask.store'
import DynamicLayoutRoot, {
  type DynamicLayoutType,
} from '@/components/DynamicLayout'
import IconMap from '@/assets/icons/jsx/IconMap'
import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconControlParams from '@/assets/icons/jsx/IconControlParams'
import IconControl from '@/assets/icons/jsx/IconControl'
import { useLocalStorageState } from 'ahooks'

type PropsType = unknown

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
      type: 'col',
      size: 900,
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
          size: 2,
          children: [
            {
              type: 'tabs',
              size: 1,
              children: [
                {
                  key: 'speed-params',
                },
              ],
            },
            {
              type: 'tabs',
              size: 1,
              children: [
                {
                  key: 'key-hints',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const ControlRoomUGV: FC<PropsType> = memo(() => {
  const { deviceId = '' } = useParams()

  const { store } = useCreateDeviceDetailStore(deviceId)
  const productKey = useStore(
    store,
    (s) =>
      (s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey)!,
  )

  const controlRoomStore = useCreateUGVControlRoomStore(
    productKey,
    deviceId,
    useServerEventMsg(),
  )

  useListenDeviceLatestTask(deviceId)

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'ugvControlRoomLayout',
    {
      defaultValue: initialLayout,
    },
  )

  const { t } = useTranslation()

  const iconMap = useMemo(
    () => ({
      map: <IconMap className="text-blue-500" />,
      video: <IconCameraVideo className="text-blue-500" />,
      'speed-params': <IconControlParams className="text-emerald-500" />,
      'key-hints': <IconControl className="text-purple-500" />,
    }),
    [],
  )

  const titleMap = useMemo(
    () => ({
      map: t('common.map'),
      video: t('common.video'),
      'speed-params': t('common.params'),
      'key-hints': t('common.control'),
    }),
    [t],
  )

  const componentMap = useMemo(
    () => ({
      map: <ControlRoomUGVMap />,
      video: (
        <div className="size-full">
          <ControlRoomUGVVideo />
        </div>
      ),
      'speed-params': (
        <div className="size-full overflow-auto p-2">
          <ControlRoomUGVSpeedParams />
        </div>
      ),
      'key-hints': (
        <div className="size-full overflow-auto p-2">
          <ControlRoomUGVKeyHints />
        </div>
      ),
    }),
    [],
  )

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <UGVControlRoomStoreContext.Provider value={controlRoomStore}>
        <div className="page-full flex flex-col">
          <ControlRoomUGVHeader />
          <main className="grow w-full relative overflow-hidden">
            <DynamicLayoutRoot
              layout={layout!}
              onLayoutChange={setLayout}
              iconMap={iconMap}
              titleMap={titleMap}
              componentMap={componentMap}
            />
          </main>
          <UGVControlRuntime />
          <ControlRoomUGVCmdSender />
        </div>
      </UGVControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
})

ControlRoomUGV.displayName = 'ControlRoomUGV'

export default ControlRoomUGV
