import IconLaser from '@/assets/icons/jsx/uav/IconLaser'
import IconPositionZoom from '@/assets/icons/jsx/uav/IconPositionZoom'
import IconButton from '@/components/ui/button/IconButton'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { lazy } from 'react'
import CameraMode from './CameraMode'
import TakePhoto from './TakePhoto'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import IconAR from '@/assets/icons/jsx/IconAR'
import IconRebuild3d from '@/assets/icons/jsx/IconRebuild3d'
import useMixARStore from '@/store/control-room/useMixAR.store'
import IconSetting from '@/assets/icons/jsx/IconSetting'
import { ConfigProvider, Drawer } from 'antd'
import AppViewSuspense from '@/components/AppViewSuspense'
import IconSmartTrack from '@/assets/icons/jsx/uav/IconSmartTrack'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import IrMeteringMode from './IrMeteringMode'
import IconTrack from '@/assets/icons/jsx/IconTrack'

const ARSetting = lazy(() => import('@/components/Header/setting/ar'))

type PropsType = unknown

export const borderedBtnClassName =
  'border border-solid border-ground-5 bg-ground-3 rounded-sm  w-[25px] h-[25px]'

const AsideToolBar: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const openLarser = useUavControlRoomStore((s) => s.openLarser)
  const updateOpenLarser = useUavControlRoomStore((s) => s.updateOpenLarser)
  const openPositionZoom = useUavControlRoomStore((s) => s.openPointZoom)

  const enableSmartTrack = useUavControlRoomStore((s) => s.enableSmartTrack)
  const updateEnableSmartTrack = useUavControlRoomStore(
    (s) => s.updateEnableSmartTrack,
  )

  const updateOpenPositionZoom = useUavControlRoomStore(
    (s) => s.updateOpenPointZoom,
  )

  const serviceHave = useDeviceDetailStore((s) => s.serviceHave)
  const propsHave = useDeviceDetailStore((s) => s.propsHave)

  const hasTapZoomAtTarget = !!serviceHave['tapZoomAtTarget']
  const hasCameraMode = !!propsHave['cameraMode']
  const hasAr = !!propsHave['ar']
  const hasLaserDistance = !!propsHave['laserDistance']
  const hasIrMeteringModeSet = !!serviceHave['irMeteringModeSet']

  const arEnable = useMixARStore((s) => s.enable)
  const updateArEnable = useMixARStore((s) => s.updateEnable)
  const updateArData = useMixARStore((s) => s.updateArData)

  const handleToggleMixAR = () => {
    updateArEnable(!arEnable)
    updateArData([])
  }

  const [vrSetting, { setTrue: setVRTrue, setFalse: setVRFalse }] =
    useBoolean(false)

  const postDeviceService = usePostDeviceService()

  const lensType = useUavControlRoomStore((s) => s.state.lensType)

  // 三维重建
  //  const hasReconstruction = !!serviceHave['Reconstruction']
  const hasReconstruction = true
  const enableReconstruction = useUavControlRoomStore(
    (s) => s.enableReconstruction,
  )
  const updateEnableReconstruction = useUavControlRoomStore(
    (s) => s.updateEnableReconstruction,
  )
  const handleToggleReconstruction = () => {
    updateEnableReconstruction(!enableReconstruction)
  }

  const hasConfirmTrack = serviceHave['confirmStartTrack']

  return (
    <div className="flex gap-2.5 text-base">
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
            className={borderedBtnClassName}
            toolTipProps={{
              title: t('controlRoom.uav.service.laserRanging.title'),
            }}
            active={openLarser}
            onClick={() => updateOpenLarser(!openLarser)}
          >
            <IconLaser />
          </IconButton>
        )}
        {hasTapZoomAtTarget && (
          <IconButton
            className={borderedBtnClassName}
            toolTipProps={{
              title: t('controlRoom.uav.service.gimbalToPoint.title'),
            }}
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
        {serviceHave['autoTrack'] && (
          <IconButton
            className={borderedBtnClassName}
            toolTipProps={{
              title: t('controlRoom.uav.service.smartTrack.title'),
            }}
            active={enableSmartTrack}
            onClick={() => {
              if (!enableSmartTrack) {
                updateEnableSmartTrack(true)
                updateOpenPositionZoom(0)
              } else {
                updateEnableSmartTrack(false)
                postDeviceService('autoTrack', { enable: false })
              }
            }}
          >
            <IconSmartTrack />
          </IconButton>
        )}
        {hasConfirmTrack && (
          <IconButton
            toolTipProps={{ title: '确认追踪' }}
            onClick={() => postDeviceService('confirmStartTrack')}
          >
            <IconTrack />
          </IconButton>
        )}
        {hasAr && (
          <IconButton
            className={borderedBtnClassName}
            active={arEnable}
            toolTipProps={{
              title: t('controlRoom.uav.service.ar.title'),
            }}
            onClick={handleToggleMixAR}
          >
            <IconAR />
          </IconButton>
        )}
        {arEnable && (
          <>
            <IconButton
              toolTipProps={{
                title: t('controlRoom.uav.service.ar.setting.title'),
              }}
              onClick={setVRTrue}
            >
              <IconSetting className="scale-95" />
            </IconButton>
            <Drawer
              open={vrSetting}
              title={t('controlRoom.uav.service.ar.setting.title')}
              mask={false}
              onClose={setVRFalse}
            >
              <AppViewSuspense>
                <ARSetting />
              </AppViewSuspense>
            </Drawer>
          </>
        )}
        {hasReconstruction && (
          <IconButton
            className={borderedBtnClassName}
            active={enableReconstruction}
            toolTipProps={{
              title: t('controlRoom.uav.service.reconstruction.title'),
            }}
            onClick={handleToggleReconstruction}
          >
            <IconRebuild3d />
          </IconButton>
        )}
        {hasIrMeteringModeSet && lensType?.toLowerCase?.() === 'ir' && (
          <IrMeteringMode postServiceFn={postDeviceService} />
        )}
      </ConfigProvider>
    </div>
  )
})

AsideToolBar.displayName = 'ControlRoomAsideToolBar'

export default AsideToolBar
