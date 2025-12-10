import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconDeviceData from '@/assets/icons/jsx/IconDeviceData'
import IconMap from '@/assets/icons/jsx/IconMap'
import IconControlParams from '@/assets/icons/jsx/IconControlParams'
import IconControl from '@/assets/icons/jsx/IconControl'
import DynamicLayoutRoot, {
  DynamicLayoutType,
} from '@/components/DynamicLayout'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import {
  useCreateUsvControlRoomStore,
  UsvControlRoomStoreContext,
} from '@/store/context-store/useUsvControlRoom.store'
import { useLocalStorageState } from 'ahooks'
import { useStore } from 'zustand'
import UsvMap from './components/Map'
import UsvVideo from './components/Video'
import AttitudePanel from './components/AttitudePanel'
import OperationsPanel from './components/OperationsPanel'
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
          size: 1,
          children: [
            {
              type: 'tabs',
              size: 3,
              children: [
                {
                  key: 'attitude',
                },
              ],
            },
            {
              type: 'tabs',
              size: 3,
              children: [
                {
                  key: 'operations',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'tabs',
      size: 360,
      children: [
        {
          key: 'device-data',
        },
      ],
    },
  ],
}

const PageControlRoomUSV: FC = memo(() => {
  const { t } = useTranslation()
  const deviceId = useParams().deviceId!
  const { store } = useCreateDeviceDetailStore(deviceId)
  const productKey = useStore(
    store,
    (s) =>
      (s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey)!,
  )

  const controlRoomStore = useCreateUsvControlRoomStore(
    productKey,
    deviceId,
    useServerEventMsg(),
  )

  useListenDeviceLatestTask(deviceId)

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'usvControlRoomLayout',
    {
      defaultValue: initialLayout,
    },
  )

  const iconMap = useMemo(
    () => ({
      map: <IconMap className="text-blue-500" />,
      video: <IconCameraVideo className="text-blue-500" />,
      attitude: <IconControlParams className="text-orange-500" />,
      operations: <IconControl className="text-purple-500" />,
      'device-data': <IconDeviceData className="text-emerald-500" />,
    }),
    [],
  )

  const titleMap = useMemo(
    () => ({
      map: t('common.map'),
      video: t('common.video'),
      attitude: '姿态',
      operations: '操作',
      'device-data': t('common.data'),
    }),
    [t],
  )

  const componentMap = useMemo(
    () => ({
      map: <UsvMap />,
      video: <UsvVideo />,
      attitude: <AttitudePanel />,
      operations: <OperationsPanel />,
      'device-data': <div className="size-full" />,
    }),
    [],
  )

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <UsvControlRoomStoreContext.Provider value={controlRoomStore}>
        <div className="page-full flex flex-col">
          <main className="relative w-full grow overflow-hidden">
            <DynamicLayoutRoot
              layout={layout!}
              onLayoutChange={setLayout}
              iconMap={iconMap}
              titleMap={titleMap}
              componentMap={componentMap}
            />
          </main>
        </div>
      </UsvControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
})

PageControlRoomUSV.displayName = 'PageControlRoomUSV'

export default PageControlRoomUSV
