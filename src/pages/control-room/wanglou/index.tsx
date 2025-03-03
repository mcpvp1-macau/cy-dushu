import DynamicLayoutRoot, {
  DynamicLayoutType,
} from '@/components/DynamicLayout'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import {
  useCreateWangLouControlRoomStore,
  WangLouControlRoomStoreContext,
} from '@/store/context-store/useWangLouControlRoom.store'
import { useLocalStorageState } from 'ahooks'
import React from 'react'
import { useStore } from 'zustand'
import useServerEventMsg from '../uav/hooks/useServerEventMsg'
import ControlRoomWanglouMap from './components/ControlRoomMap'
import ControlRoomVideo from './components/ControlRoomVideo'
import StatusInfo from './components/StatusInfo'
import ControlPanl from './components/ControlPanl'
import DataPanl from './components/DataPanl'
import Header from './components/Header'

export const initialLayout: DynamicLayoutType = {
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
          type: 'tabs',
          size: 3,
          children: [
            {
              key: 'video2',
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
          key: 'status',
        },
        {
          key: 'device-control',
        },
        {
          key: 'ai-list',
        },
      ],
    },
  ],
}

const PageControlRoomWangLou: React.FC = () => {
  const deviceId = useParams().deviceId!
  const { store } = useCreateDeviceDetailStore(deviceId)
  const productKey = useStore(
    store,
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )

  const deviceName = useStore(store, (s) => s.deviceDetail?.deviceName)
  const controlRoomStore = useCreateWangLouControlRoomStore(
    productKey!,
    deviceId,
    useServerEventMsg(),
  )
  const { t } = useTranslation()
  // 子设备
  const childDevice = useStore(store, (s) => s.deviceDetail?.childDevice)

  const { infraredData, visibleData } = useMemo(() => {
    let infraredData = {} as API_DEVICE.domain.Device
    let visibleData = {} as API_DEVICE.domain.Device
    childDevice?.forEach((item) => {
      if (item.deviceType === 'INFRARED_CAMERA') {
        infraredData = item
      } else if (item.deviceType === 'VISIBLE_LIGHT_CAMERA') {
        visibleData = item
      }
    })
    return {
      infraredData, //.videoList?.[0],
      visibleData, //.videoList?.[0],
    }
  }, [childDevice])

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'wanglou-control-room-layout',
    { defaultValue: initialLayout },
  )
  const titleMap = useMemo(
    () => ({
      map: t('common.map'),
      video: t('ja-ke-jian-guang-shi-pin'),
      video2: t('ja-hong-wai-shi-pin'),
      ['ai-list']: t('ja-ai-shu-ju'),
      ['device-control']: t('ja-she-bei-kong-zhi'),
      ['status']: t('ja-she-bei-zhuang-tai'),
    }),
    [],
  )
  const componentMap = useMemo(
    () => ({
      map: <ControlRoomWanglouMap />,
      video: (
        <ControlRoomVideo
          productKey={visibleData.productKey}
          deviceId={visibleData.deviceId}
          videoId={visibleData.properties?.videoList?.[0]?.videoId || ''}
        />
      ),
      video2: (
        <ControlRoomVideo
          productKey={infraredData.productKey}
          deviceId={infraredData.deviceId}
          videoId={infraredData.properties?.videoList?.[0]?.videoId || ''}
        />
      ),
      status: <StatusInfo />,
      ['device-control']: <ControlPanl />,
      ['ai-list']: <DataPanl />,
    }),
    [productKey, deviceId],
  )

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <WangLouControlRoomStoreContext.Provider value={controlRoomStore}>
        {/* <StateResolver /> */}
        <div className="page-full flex flex-col">
          {/* <ControlRoomUavHeader /> */}
          <Header deviceName={deviceName!} />
          <main className="grow w-full relative overflow-hidden">
            <DynamicLayoutRoot
              layout={layout!}
              onLayoutChange={setLayout}
              //   iconMap={iconMap}
              componentMap={componentMap}
              titleMap={titleMap}
            />
          </main>
        </div>
        {/* <ControlCMDSender /> */}
      </WangLouControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
}

PageControlRoomWangLou.displayName = 'PageControlRoomWangLou'

export default PageControlRoomWangLou
