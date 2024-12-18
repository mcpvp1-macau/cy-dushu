import IconIntelligentTrack from '@/assets/icons/jsx/uav/IconIntelligentTrack'
import IconLaser from '@/assets/icons/jsx/uav/IconLaser'
import IconPositionZoom from '@/assets/icons/jsx/uav/IconPositionZoom'
import IconButton from '@/components/ui/button/IconButton'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { lazy, memo, type FC } from 'react'
import CameraMode from './CameraMode'
import TakePhoto from './TakePhoto'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import IconAR from '@/assets/icons/jsx/IconAR'
import useMixARStore from '@/store/control-room/useMixAR.store'
import IconSetting from '@/assets/icons/jsx/IconSetting'
import { ConfigProvider, Drawer } from 'antd'
import AppViewSuspense from '@/components/AppViewSuspense'
import ZoomFocusMode from './ZoomFocusMode'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'

const VRSetting = lazy(() => import('@/components/Header/setting/VRSetting'))

type PropsType = unknown

const AsideToolBar: FC<PropsType> = memo(() => {
  const openLarser = useUavControlRoomStore((s) => s.openLarser)
  const updateOpenLarser = useUavControlRoomStore((s) => s.updateOpenLarser)
  const openPositionZoom = useUavControlRoomStore((s) => s.openPointZoom)
  const updateEnableSmartTrack = useUavControlRoomStore(
    (s) => s.updateEnableSmartTrack,
  )
  const updateOpenPositionZoom = useUavControlRoomStore(
    (s) => s.updateOpenPointZoom,
  )

  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const propsHave = useDeviceDetailStore((s) => s.propsHave)

  const hasSmartTrack = !!serviceHave['smartTrack']
  const hasTapZoomAtTarget = !!serviceHave['tapZoomAtTarget']
  const hasCameraMode = !!propsHave['cameraMode']
  const hasAr = !!propsHave['ar']
  const hasLaserDistance = !!propsHave['laserDistance']
  const hasZoomFocusMode = !!propsHave['zoomFocusMode']

  const arEnable = useMixARStore((s) => s.enable)
  const updateArEnable = useMixARStore((s) => s.updateEnable)
  const updateArData = useMixARStore((s) => s.updateArData)

  const handleToggleMixAR = () => {
    updateArEnable(!arEnable)
    updateArData([])
  }

  const [vrSetting, { setTrue: setVRTrue, setFalse: setVRFalse }] =
    useBoolean(false)

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const postDeviceService = usePostDeviceService(productKey, deviceId)

  return (
    <div className="px-3 py-1 flex gap-2.5 text-base">
      <ConfigProvider
        theme={{
          components: {
            Dropdown: {
              paddingBlock: 2,
              controlPaddingHorizontal: 6,
            },
          },
        }}
      >
        {hasLaserDistance && (
          <IconButton
            toolTipProps={{ title: '激光测距' }}
            active={openLarser}
            onClick={() => updateOpenLarser(!openLarser)}
          >
            <IconLaser />
          </IconButton>
        )}
        {hasTapZoomAtTarget && (
          <IconButton
            toolTipProps={{ title: '指点变焦' }}
            active={openPositionZoom === 1}
            onClick={() =>
              updateOpenPositionZoom(openPositionZoom === 1 ? 0 : 1)
            }
          >
            <IconPositionZoom />
          </IconButton>
        )}
        {hasCameraMode && <CameraMode />}
        <TakePhoto />
        {hasSmartTrack && (
          <IconButton
            toolTipProps={{ title: '智能追踪' }}
            onClick={() => updateEnableSmartTrack()}
          >
            <IconIntelligentTrack />
          </IconButton>
        )}
        {hasAr && (
          <IconButton
            active={arEnable}
            toolTipProps={{ title: '虚实融合' }}
            onClick={handleToggleMixAR}
          >
            <IconAR />
          </IconButton>
        )}
        {arEnable && (
          <>
            <IconButton
              toolTipProps={{ title: '虚实融合设置' }}
              onClick={setVRTrue}
            >
              <IconSetting className="scale-95" />
            </IconButton>
            <Drawer
              open={vrSetting}
              title="虚实融合设置"
              mask={false}
              onClose={setVRFalse}
            >
              <AppViewSuspense>
                <VRSetting />
              </AppViewSuspense>
            </Drawer>
          </>
        )}
        {hasZoomFocusMode && <ZoomFocusMode postSerivce={postDeviceService} />}
      </ConfigProvider>
    </div>
  )
})

AsideToolBar.displayName = 'ControlRoomAsideToolBar'

export default AsideToolBar
