import IconCamera from '@/assets/icons/jsx/IconCamera'
import IconCameraMode from '@/assets/icons/jsx/IconCameraMode'
import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { setDeviceProp } from '@/service/modules/device'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { GetProps, Menu, Tooltip } from 'antd'
import { borderedBtnClassName } from '.'
import IconPanorama from '@/assets/icons/jsx/IconPanorma'

type PropsType = unknown

/** 相机模式 */
const CameraMode: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const videoSource = useUavControlRoomStore((s) => s.state.videoSource)
  const hasCameraMode = useDeviceDetailStore((s) => s.propsHave['cameraMode'])
  const cameraMode = useUavControlRoomStore((s) => s.state.cameraMode)

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const msgApi = useAppMsg()
  const handleClick = async (key: string) => {
    await setDeviceProp(productKey, deviceId, {
      cameraMode: key,
    })
    msgApi.success(t('api.success.msg'))
  }

  const cameraModeMenuItems = useMemo<GetProps<typeof Menu>['items']>(() => {
    if (!hasCameraMode || videoSource !== 'gimbal') {
      return []
    }
    return [
      {
        key: '0',
        label: (
          <Tooltip
            title={t('controlRoom.uav.service.cameraMode.photo.title')}
            placement="right"
          >
            <div className={clsx('flex flex-col items-center my-0.5')}>
              <IconCamera />
              <span className="text-[8px] h-[10px] leading-3">
                {t('controlRoom.uav.service.takePhoto.title')}
              </span>
            </div>
          </Tooltip>
        ),
      },
      {
        key: '1',
        label: (
          <Tooltip
            title={t('controlRoom.uav.service.cameraMode.record.title')}
            placement="right"
          >
            <div className={clsx('flex flex-col items-center my-0.5')}>
              <IconCameraVideo />
              <span className="text-[8px] h-[10px] leading-[10px]">
                {t('controlRoom.uav.service.videoRecord.title')}
              </span>
            </div>
          </Tooltip>
        ),
      },
      // 全景拍摄模式
      {
        key: '3',
        label: (
          <Tooltip
            title={t('controlRoom.uav.service.cameraMode.panorama.title')}
            placement="right"
          >
            <div className={clsx('flex flex-col items-center my-0.5')}>
              <IconPanorama />
              <span className="text-[8px] h-[10px] leading-[10px]">
                {t('controlRoom.uav.service.panorama.title')}
              </span>
            </div>
          </Tooltip>
        ),
      },
    ]
  }, [hasCameraMode, videoSource, cameraMode])

  return (
    <IconButtonWithDropDown
      className={borderedBtnClassName}
      disabled={cameraModeMenuItems?.length === 0}
      menu={{
        items: cameraModeMenuItems,
        activeKey: cameraMode,
        onClick: (info) => {
          handleClick(info.key)
        },
      }}
    >
      {{
        '0': <IconCamera />,
        '1': <IconCameraVideo />,
        '3': <IconPanorama />,
      }[cameraMode ?? '-1'] || <IconCameraMode />}
    </IconButtonWithDropDown>
  )
})

CameraMode.displayName = 'CameraMode'

export default CameraMode
