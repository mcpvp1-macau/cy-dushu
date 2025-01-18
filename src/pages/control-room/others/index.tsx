import DynamicLayoutRoot, {
  DynamicLayoutType,
} from '@/components/DynamicLayout'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useDeepCompareEffect, useLocalStorageState } from 'ahooks'
import React from 'react'
import { useStore } from 'zustand'
import useServerEventMsg from '../uav/hooks/useServerEventMsg'
import ControlRoomWanglouMap from './components/ControlRoomMap'
import ControlRoomVideo from './components/ControlRoomVideo'
import StatusInfo from './components/StatusInfo'
import ControlPanl from './components/ControlPanl'
import DataPanl from './components/DataPanl'
import {
  OthersControlRoomStoreContext,
  useCreateOthersControlRoomStore,
} from '@/store/context-store/useOthersControlRoom.store'
import { DynamicLayoutTabsType } from '@/components/DynamicLayout/components/DynamicLayoutTabs'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import * as _ from 'lodash'

// TODO 后续根据产品自定义
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
          children: [{ key: 'status', title: '地图' }],
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

  const isHaveTapZoomAtTarget = useStore(
    store,
    (s) => !!s.deviceDetail?.deviceModel?.services?.['tapZoomAtTarget'],
  )
  const post = usePostDeviceService(productKey!, deviceId)
  const videoList = useStore(
    store,
    (s) => s.deviceDetail?.properties?.videoList || [],
  )
  // 子设备
  const childDevice = useStore(store, (s) => s.deviceDetail?.childDevice)

  const childDeviceVideos = useMemo(() => {
    const arr: API_DEVICE.domain.Device[] = []
    childDevice?.forEach((item) => {
      if (item?.properties?.videoList?.length) arr.push(item)
    })
    return arr
  }, [childDevice])

  const videoTabs: {
    type: 'tabs'
    activeKey?: string
    children: DynamicLayoutTabsType
    size: number
  }[] = []

  const videoMap = {}

  /** 设备自身的视频 */
  for (let index = 0; index < videoList?.length; index++) {
    const item = videoList[index]
    const key = `${item.name}-${item.videoId}-${deviceId}`
    videoTabs.push({
      type: 'tabs',
      size: 3,
      children: [
        {
          key: key,
          title: item.name,
        },
      ],
    })
    videoMap[key] = (
      <ControlRoomVideo
        productKey={productKey!}
        deviceId={deviceId}
        videoId={item.videoId}
        parentPost={post}
        isHaveTapZoomAtTarget={isHaveTapZoomAtTarget}
      />
    )
  }
  /** 子设备的视频 */
  for (let index = 0; index < childDeviceVideos.length; index++) {
    const item = childDeviceVideos[index]
    for (
      let index = 0;
      index < (item.properties?.videoList?.length || 0);
      index++
    ) {
      const video = item.properties.videoList?.[index]
      const key = `${video?.name}-${video?.videoId}-${item.deviceId}`
      video &&
        videoTabs.push({
          type: 'tabs',
          size: 3,
          children: [
            {
              key: key,
              title: item.deviceName || item.name || video.name,
            },
          ],
        })

      videoMap[key] = (
        <ControlRoomVideo
          productKey={item.deviceModel.productKey!}
          deviceId={item.deviceId}
          videoId={video?.videoId || ''}
          parentPost={post}
          isHaveTapZoomAtTarget={isHaveTapZoomAtTarget}
        />
      )
    }
  }

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'others-control-room-layout',
    { defaultValue: initialLayout },
  )

  const componentMap = useMemo(() => {
    const map = {
      map: <ControlRoomWanglouMap />,
      ...videoMap,
      status: <StatusInfo />,
      ['device-control']: <ControlPanl />,
    }
    return map
  }, [productKey, deviceId, videoMap])

  // useEffect(() => {
  //   setLayout(initialLayout)
  // }, [JSON.stringify(initialLayout)])

  useDeepCompareEffect(() => {
    const l = _.cloneDeep(layout)
    if (l && l.children[1])
      (l.children[1] as DynamicLayoutType).children = videoTabs
    setLayout(layout)
  }, [videoTabs])

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
