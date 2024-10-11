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
import FloatIconButton from '@/components/ui/button/FloatIconButton'
import IconToggle from '@/assets/icons/jsx/IconToggle'
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
import AppCollapse from '@/components/AppCollapse'
import ControlRoomUavMap from './components/ControlRoomMap'
import { message } from 'antd'
import { AppMsgContext } from '@/hooks/useAppMsg'
import useServerEventMsg from './hooks/useServerEventMsg'

type PropsType = unknown

const PageControlRoomUav: FC<PropsType> = memo(() => {
  const deviceId = useParams().deviceId!
  const { store } = useCreateDeviceDetailStore(deviceId)
  const productKey = useStore(
    store,
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )

  // 覆盖于全局的 message, 该 top 会向下偏一点
  const [controlRoomMessageApi, contextHolder] = message.useMessage({
    top: 45 + 20,
    maxCount: 3,
  })

  const controlRoomStore = useCreateUavControlRoomStore(
    productKey,
    deviceId,
    useServerEventMsg(controlRoomMessageApi), // 暂时只有这种情况, 先这么写
  )

  const [active, setActive] = useState('video')
  const asideRef = useRef<HTMLDivElement>(null)

  return (
    <DeviceDetailStoreContext.Provider value={store}>
      <UavControlRoomStoreContext.Provider value={controlRoomStore}>
        <AppMsgContext.Provider value={controlRoomMessageApi}>
          {contextHolder}
          <div className="page-full bg-black flex flex-col">
            <ControlRoomUavHeader />
            <main className="grow w-full relative overflow-hidden">
              {/* map */}
              <div
                className={clsx('absolute', {
                  'inset-0': active === 'map',
                  'top-[1px] right-[1px] w-[400px] h-[300px] z-50':
                    active === 'video',
                })}
              >
                <ControlRoomUavMap />
                {active === 'video' && (
                  <FloatIconButton
                    className="absolute top-2 left-2 z-10"
                    onClick={() => setActive('map')}
                  >
                    <IconToggle />
                  </FloatIconButton>
                )}
              </div>
              {/* video */}
              <div
                className={clsx('absolute', {
                  'inset-0': active === 'video',
                  'top-[1px] right-[1px] w-[400px] h-[300px] z-50':
                    active === 'map',
                })}
              >
                <ControlRoomVideo />
                {active === 'map' && (
                  <FloatIconButton
                    className="absolute top-2 left-2 z-10"
                    onClick={() => setActive('video')}
                  >
                    <IconToggle />
                  </FloatIconButton>
                )}
              </div>
              {/* 右侧小窗口 */}
              <aside className="absolute top-0 right-0 w-[400px] p-[1px] box-content bg-ground-100 bg-opacity-90 backdrop-blur z-[41]">
                {/* 小窗口 placeholder */}
                <div
                  ref={asideRef}
                  className="h-[300px] bg-black relative"
                ></div>
                <AppCollapse
                  defaultActiveKey={['buttons']}
                  items={[
                    {
                      key: 'buttons',
                      label: '飞行控制',
                      children: (
                        <div>
                          <AsideToolBar />
                          <AsideButtons />
                        </div>
                      ),
                    },
                  ]}
                />
              </aside>
              <aside className="absolute top-3 left-3 flex gap-3 items-center z-50">
                <ControlRoomUavCameraSwitch />
                <FallbackMessage />
              </aside>
              <GimbalSwitch />
              <footer className="absolute bottom-11 left-1/2 -translate-x-1/2 z-50">
                <BottomButtons />
              </footer>
              <Zoom />
              <FlyParamsSetting />
            </main>
          </div>
          <ControlCMDSender />
        </AppMsgContext.Provider>
      </UavControlRoomStoreContext.Provider>
    </DeviceDetailStoreContext.Provider>
  )
})

PageControlRoomUav.displayName = 'ControlRoomUav'

export default PageControlRoomUav
