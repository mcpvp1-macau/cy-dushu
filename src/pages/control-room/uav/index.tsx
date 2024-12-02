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
import DynamicLayout, { DynamicLayoutType } from '@/components/DynamicLayout'
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

type PropsType = unknown

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

  const layout = useMemo<DynamicLayoutType>(
    () => ({
      type: 'row',
      size: 1,
      children: [
        {
          size: 2,
          type: 'col',
          children: [
            {
              size: 2,
              tabs: [
                {
                  key: 'map',
                  title: '地图',
                  icon: <IconMap className="text-primary" />,
                  children: <ControlRoomUavMap />,
                },
              ],
            },
            {
              size: 1,
              tabs: [
                {
                  key: 'flyButtons',
                  title: '操作',
                  icon: <DeviceIconUAV2 className="text-purple-600" />,
                  children: (
                    <>
                      <AsideToolBar />
                      <AsideButtons />
                    </>
                  ),
                },
              ],
            },
          ],
        },
        {
          size: 5,
          type: 'col',
          children: [
            {
              size: 2,
              tabs: [
                {
                  key: 'video',
                  title: '视频',
                  icon: <IconCameraVideo className="text-primary" />,
                  children: (
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
                },
              ],
            },
            {
              size: 1,
              type: 'row',
              children: [
                {
                  size: 4,
                  tabs: [
                    {
                      key: 'flyParams',
                      title: '飞行操控',
                      icon: <IconGamepad className="text-orange-600" />,
                      children: (
                        <div className="absolute inset-0 flex justify-center scale-90">
                          <BottomButtons />
                        </div>
                      ),
                    },
                  ],
                },
                {
                  size: 3,
                  tabs: [
                    {
                      key: 'flyParamsSetting',
                      title: '飞行参数',
                      icon: <FormOutlined className="text-emerald-600" />,
                      children: <FlyParamsSetting />,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          size: 2,
          tabs: [
            {
              title: 'AI 算法',
              icon: <IconAISwitch className="text-violet-500" />,
              key: 'ai-list',
              children: (
                <div className="text-sm">
                  <DeviceAlgorithmList
                    productKey={productKey}
                    deviceId={deviceId}
                    deviceType={DeviceEnum.UAV}
                  />
                </div>
              ),
            },
            {
              title: '设备数据',
              icon: <IconData className="text-emerald-500" />,
              key: 'device-data',
              children: (
                <div className="text-sm">
                  <UavDetailData />
                </div>
              ),
            },
          ],
        },
      ],
    }),
    [],
  )

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <UavControlRoomStoreContext.Provider value={controlRoomStore}>
        <div className="page-full flex flex-col">
          <ControlRoomUavHeader />
          <main className="grow w-full relative overflow-hidden">
            <DynamicLayout layout={layout} />
          </main>
        </div>
        <ControlCMDSender />
      </UavControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
})

PageControlRoomUav.displayName = 'ControlRoomUav'

export default PageControlRoomUav
