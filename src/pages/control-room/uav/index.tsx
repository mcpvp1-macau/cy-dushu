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
import ControlRoomVideo from './components/ControlRoomVideo'
import AsideToolBar from './components/AsideToolBar'
import ControlRoomUavCameraSwitch from './components/CameraSwitch'
import FallbackMessage from './components/FallbackMessage'
import GimbalSwitch from './components/GimbalSwitch'
import AsideButtons from './components/AsideButtons'
import BottomButtons from './components/BottomButtons'
import ControlCMDSender from './components/ControlCMDSender'
import Zoom from './components/Zoom'
import FlyParamsSetting from './components/FlyParamsSetting'
import ControlRoomUavMap from './components/ControlRoomMap'
import useServerEventMsg from './hooks/useServerEventMsg'
import type { DynamicLayoutType } from '@/components/DynamicLayout'
import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconMap from '@/assets/icons/jsx/IconMap'
import { FormOutlined } from '@ant-design/icons'
import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import IconGamepad from '@/assets/icons/jsx/uav/IconGamepad'
import IconAISwitch from '@/assets/icons/jsx/IconAISwitch'
import DeviceAlgorithmList from '@/components/device/algorithm/DeviceAlgorithmList'
import { DeviceEnum } from '@/enum/device'
import IconData from '@/assets/icons/jsx/IconData'
import UavDetailData from '@/pages/right/DeviceDetail/UavDetail/components/UavDetailData'
import StateResolver from './components/StateResolver'
import DynamicLayoutRoot from '@/components/DynamicLayout'
import { useLocalStorageState, useThrottleEffect } from 'ahooks'

type PropsType = unknown

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
              title: '视频',
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
                  key: 'flyParams',
                  title: '飞行操控',
                },
              ],
            },
            {
              type: 'tabs',
              size: 3,
              children: [
                {
                  key: 'flyButtons',
                  title: '操作',
                },
                {
                  key: 'flyParamsSetting',
                  title: '飞行参数',
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
          title: 'AI 算法',
          key: 'ai-list',
        },
        {
          title: '设备数据',
          key: 'device-data',
        },
      ],
    },
  ],
}

const PageControlRoomUav: FC<PropsType> = memo(() => {
  const deviceId = useParams().deviceId!
  const { store } = useCreateDeviceDetailStore(deviceId)
  const productKey = useStore(
    store,
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )

  const controlRoomStore = useCreateUavControlRoomStore(
    productKey,
    deviceId,
    useServerEventMsg(),
  )

  const [layout, setLayout] = useLocalStorageState<DynamicLayoutType>(
    'uav-control-room-layout',
    { defaultValue: initialLayout },
  )

  useThrottleEffect(
    () => {
      console.log(layout)
    },
    [layout],
    {
      trailing: true,
      wait: 1000,
    },
  )

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <UavControlRoomStoreContext.Provider value={controlRoomStore}>
        <StateResolver />
        <div className="page-full flex flex-col">
          <ControlRoomUavHeader />
          <main className="grow w-full relative overflow-hidden">
            <DynamicLayoutRoot
              layout={layout!}
              onLayoutChange={setLayout}
              iconMap={{
                map: <IconMap className="text-blue-500" />,
                video: <IconCameraVideo className="text-blue-500" />,
                flyParams: <IconGamepad className="text-orange-500" />,
                flyButtons: <DeviceIconUAV2 className="text-purple-500" />,
                flyParamsSetting: <FormOutlined className="text-emerald-500" />,
                'ai-list': <IconAISwitch className="text-violet-500" />,
                'device-data': <IconData className="text-emerald-500" />,
              }}
              componentMap={{
                map: <ControlRoomUavMap />,
                video: (
                  <div className="size-full relative">
                    <ControlRoomVideo />
                    <aside className="absolute top-3 left-3 flex gap-3 items-center z-50">
                      <ControlRoomUavCameraSwitch />
                      <FallbackMessage />
                    </aside>
                    <GimbalSwitch />
                    <Zoom />
                  </div>
                ),
                flyParams: (
                  <div className="absolute inset-0 flex justify-center scale-90">
                    <BottomButtons />
                  </div>
                ),
                flyParamsSetting: <FlyParamsSetting />,
                ['device-data']: <UavDetailData />,
                flyButtons: (
                  <>
                    <AsideToolBar />
                    <AsideButtons />
                  </>
                ),
                ['ai-list']: (
                  <div className="text-sm">
                    <DeviceAlgorithmList
                      productKey={productKey}
                      deviceId={deviceId}
                      deviceType={DeviceEnum.UAV}
                    />
                  </div>
                ),
              }}
            />
          </main>
        </div>
        <ControlCMDSender />
      </UavControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
})

PageControlRoomUav.displayName = 'ControlRoomUav'

export default PageControlRoomUav
