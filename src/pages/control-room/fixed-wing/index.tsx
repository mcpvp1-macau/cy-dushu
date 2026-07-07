import IconAISwitch from '@/assets/icons/jsx/IconAISwitch'
import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconControl from '@/assets/icons/jsx/IconControl'
import IconDeviceData from '@/assets/icons/jsx/IconDeviceData'
import IconMap from '@/assets/icons/jsx/IconMap'
import IconPayload from '@/assets/icons/jsx/IconPayload'
import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import IconFlightOperation from '@/assets/icons/jsx/uav/IconFlightOperation'
import DeferredRender from '@/components/DeferredRender'
import DynamicLayoutRoot from '@/components/DynamicLayout'
import TanqiDemo from '@/components/Tanqi/demo/TanqiDemo'
import { getFixedWingDemoDevice } from '@/demo/fixed-wing/constants'
import useFixedWingDemoStore from '@/demo/fixed-wing/useFixedWingDemo.store'
import {
  DeviceDetailStoreContext,
  useCreateDeviceDetailStore,
} from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import {
  UavControlRoomStoreContext,
  useCreateUavControlRoomStore,
} from '@/store/context-store/useUavControlRoom.store'
import { lazy } from 'react'
import AsideToolBar from '../uav/components/AsideToolBar'
import FixedWingHeader from './components/FixedWingHeader'
import FixedWingVideo from './components/FixedWingVideo'
import RightEmptyPanel from './components/RightEmptyPanel'
import { useFixedWingLayoutStore } from './hooks/useFixedWingLayout.store'

const FixedWingMap = lazy(() => import('./components/FixedWingMap'))
// 复用无人机驾驶舱的操控/操作面板 (固定翼接口未接入, 置灰展示)
const BottomButtons = lazy(() => import('../uav/components/BottomButtons'))
const AsideButtons = lazy(() => import('../uav/components/AsideButtons'))

type PropsType = unknown

/**
 * 固定翼驾驶舱（吊舱视角）
 * 布局框架与无人机驾驶舱一致 (DynamicLayout): 左地图 / 中视频 + 底部仪表与吊舱操作 / 右侧页签
 */
const PageControlRoomFixedWing: FC<PropsType> = memo(() => {
  const deviceId = useParams().deviceId!
  const device = getFixedWingDemoDevice(deviceId)
  const deviceNo = useFixedWingDemoStore((s) => s.deviceNo)
  const deviceName = device?.deviceName ?? deviceNo
  const productKey = device?.productKey ?? 'fixed-wing-demo'

  // 提供与无人机驾驶舱一致的上下文, 以复用其操控/操作面板
  const { store } = useCreateDeviceDetailStore(deviceId)
  const controlRoomStore = useCreateUavControlRoomStore(productKey, deviceId)

  const layout = useFixedWingLayoutStore((s) => s.layout)
  const updateLayout = useFixedWingLayoutStore((s) => s.updateLayout)

  const iconMap = useMemo(
    () => ({
      map: <IconMap className="text-blue-500" />,
      video: <IconCameraVideo className="text-blue-500" />,
      control: <IconFlightOperation className="text-orange-500" />,
      operation: <IconControl className="text-purple-500" />,
      payload: <IconPayload className="text-emerald-500" />,
      algorithm: <IconAISwitch className="text-violet-500" />,
      'device-data': <IconDeviceData className="text-orange-500" />,
      tanqi: <IconTanQi className="text-emerald-500" />,
    }),
    [],
  )

  const titleMap = useMemo(
    () => ({
      map: '地图',
      video: '视频',
      control: '操控',
      operation: '操作',
      payload: '负载',
      algorithm: '算法',
      'device-data': '数据',
      tanqi: '檀棋',
    }),
    [],
  )

  const componentMap = useMemo(
    () => ({
      map: (
        <DeferredRender>
          <FixedWingMap deviceName={deviceName} />
        </DeferredRender>
      ),
      video: <FixedWingVideo />,
      // 与已有飞机驾驶舱完全一致, 仅置灰 (控制接口未接入)
      control: (
        <div className="absolute inset-0 flex justify-center scale-90 opacity-60 pointer-events-none select-none">
          <BottomButtons />
        </div>
      ),
      operation: (
        <div className="absolute inset-0 flex justify-center items-center opacity-60 pointer-events-none select-none">
          <div className="w-full max-w-[520px] min-w-[300px] px-2 flex flex-col gap-2.5">
            <AsideToolBar />
            <AsideButtons />
          </div>
        </div>
      ),
      payload: <RightEmptyPanel />,
      algorithm: <RightEmptyPanel />,
      'device-data': <RightEmptyPanel />,
      tanqi: <TanqiDemo />,
    }),
    [deviceName],
  )

  return (
    <DeviceDetailStoreContext.Provider key={deviceId} value={store}>
      <UavControlRoomStoreContext.Provider value={controlRoomStore}>
        <div className="page-full flex flex-col">
          <FixedWingHeader deviceName={deviceName} />
          <main className="grow w-full relative overflow-hidden">
            <DynamicLayoutRoot
              layout={layout}
              onLayoutChange={updateLayout}
              iconMap={iconMap}
              titleMap={titleMap}
              componentMap={componentMap}
            />
          </main>
        </div>
      </UavControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
})

PageControlRoomFixedWing.displayName = 'PageControlRoomFixedWing'

export default PageControlRoomFixedWing
