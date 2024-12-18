import IconCamera from '@/assets/icons/jsx/IconCamera'
import IconCameraMode from '@/assets/icons/jsx/IconCameraMode'
import IconCameraVideo from '@/assets/icons/jsx/IconCameraVideo'
import IconButtonWithDropDown from '@/components/IconButtonWithDropDown'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { setDeviceProp } from '@/service/modules/device'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { GetProps, Menu, Tooltip } from 'antd'
import { borderedBtnClassName } from '.'

type PropsType = unknown

/** 相机模式 */
const CameraMode: FC<PropsType> = memo(() => {
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
    msgApi.success('设置成功')
  }

  const cameraModeMenuItems = useMemo<GetProps<typeof Menu>['items']>(() => {
    if (!hasCameraMode || videoSource !== 'gimbal') {
      return []
    }
    return [
      {
        key: '0',
        label: (
          <Tooltip title="拍照模式" placement="right">
            <div className={clsx('flex flex-col items-center')}>
              <IconCamera />
              <span className="text-[8px] h-[10px] leading-[10px]">拍照</span>
            </div>
          </Tooltip>
        ),
      },
      {
        key: '1',
        label: (
          <Tooltip title="录像模式" placement="right">
            <div className={clsx('flex flex-col items-center')}>
              <IconCameraVideo />
              <span className="text-[8px] h-[10px] leading-[10px]">录像</span>
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
      <IconCameraMode />
    </IconButtonWithDropDown>
  )
})

CameraMode.displayName = 'CameraMode'

export default CameraMode
