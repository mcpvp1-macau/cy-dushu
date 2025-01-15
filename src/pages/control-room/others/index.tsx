import DynamicLayoutRoot, {
  DynamicLayoutType,
} from '@/components/DynamicLayout'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useLocalStorageState } from 'ahooks'
import React from 'react'
import { useStore } from 'zustand'
import useServerEventMsg from '../uav/hooks/useServerEventMsg'
import ControlRoomWanglouMap from './components/ControlRoomMap'
import ControlRoomVideo from './components/ControlRoomVideo'
import StatusInfo from './components/StatusInfo'
import ControlPanl from './components/ControlPanl'
import DataPanl from './components/DataPanl'
import { OthersControlRoomStoreContext, useCreateOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'

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
          title: '地图',
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
              title: '可见光视频',
            },
          ],
        },
        {
          type: 'tabs',
          size: 3,
          children: [
            {
              key: 'video2',
              title: '红外视频',
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
          title: '设备状态',
          key: 'status',
        },
        {
          title: '设备控制',
          key: 'device-control',
        },
        {
          title: 'AI 数据',
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
  const controlRoomStore = useCreateOthersControlRoomStore(
    productKey!,
    deviceId,
    useServerEventMsg(),
  )

  // 子设备
  const childDevice = useStore(store, (s) => s.deviceDetail?.childDevice)

  // const { infraredData, visibleData } = useMemo(() => {
  //   let infraredData = {} as API_DEVICE.domain.Device
  //   let visibleData = {} as API_DEVICE.domain.Device
  //   childDevice?.forEach((item) => {
  //     if (item.deviceType === 'INFRARED_CAMERA') {
  //       infraredData = item
  //     } else if (item.deviceType === 'VISIBLE_LIGHT_CAMERA') {
  //       visibleData = item
  //     }
  //   })
  //   return {
  //     infraredData, //.videoList?.[0],
  //     visibleData, //.videoList?.[0],
  //   }
  // }, [childDevice])

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'others-control-room-layout',
    { defaultValue: initialLayout },
  )

  const componentMap = useMemo(
    () => ({
      map: <ControlRoomWanglouMap />,
      // video: (
      //   <ControlRoomVideo
      //     productKey={visibleData.productKey}
      //     deviceId={visibleData.deviceId}
      //     videoId={visibleData.properties?.videoList?.[0]?.videoId || ''}
      //   />
      // ),
      // video2: (
      //   <ControlRoomVideo
      //     productKey={infraredData.productKey}
      //     deviceId={infraredData.deviceId}
      //     videoId={infraredData.properties?.videoList?.[0]?.videoId || ''}
      //   />
      // ),
      // status: <StatusInfo />,
      // ['device-control']: <ControlPanl />,
      // ['ai-list']: <DataPanl />,
    }),
    [productKey, deviceId],
  )

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <OthersControlRoomStoreContext.Provider value={controlRoomStore}>
        <div className="page-full flex flex-col">
          <main className="grow w-full relative overflow-hidden">
            <DynamicLayoutRoot
              layout={layout!}
              onLayoutChange={setLayout}
              //   iconMap={iconMap}
              componentMap={componentMap}
            />
          </main>
        </div>
      </OthersControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
}

PageControlRoomWangLou.displayName = 'PageControlRoomWangLou'

export default PageControlRoomWangLou
