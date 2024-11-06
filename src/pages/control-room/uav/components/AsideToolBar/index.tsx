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
import { Drawer } from 'antd'
import AppViewSuspense from '@/components/AppViewSuspense'

const VRSetting = lazy(() => import('@/components/Header/setting/VRSetting'))

type PropsType = unknown

const AsideToolBar: FC<PropsType> = memo(() => {
  const openLarser = useUavControlRoomStore((s) => s.openLarser)
  const updateOpenLarser = useUavControlRoomStore((s) => s.updateOpenLarser)
  const openPositionZoom = useUavControlRoomStore((s) => s.openPointZoom)
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

  const arEnable = useMixARStore((s) => s.enable)
  const updateArEnable = useMixARStore((s) => s.updateEnable)
  const updateArData = useMixARStore((s) => s.updateArData)

  const handleToggleMixAR = () => {
    updateArEnable(!arEnable)
    updateArData([])
  }

  const [vrSetting, { setTrue: setVRTrue, setFalse: setVRFalse }] =
    useBoolean(false)

  return (
    <div className="px-3 py-1 flex gap-2.5 text-base">
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
          onClick={() => updateOpenPositionZoom(openPositionZoom === 1 ? 0 : 1)}
        >
          <IconPositionZoom />
        </IconButton>
      )}
      {hasCameraMode && <CameraMode />}
      <TakePhoto />
      {hasSmartTrack && (
        <IconButton toolTipProps={{ title: '智能追踪' }}>
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
    </div>
  )
})

AsideToolBar.displayName = 'ControlRoomAsideToolBar'

export default AsideToolBar
