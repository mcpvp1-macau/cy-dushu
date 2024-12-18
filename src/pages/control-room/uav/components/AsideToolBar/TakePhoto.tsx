import IconTakePhoto from '@/assets/icons/jsx/uav/IconTakePhoto'
import IconButton from '@/components/ui/button/IconButton'
import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'
import { borderedBtnClassName } from '.'

type PropsType = unknown

/** 拍照 */
const TakePhoto: FC<PropsType> = memo(() => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)

  const videoSource = useUavControlRoomStore((s) => s.state.videoSource)
  const hasCameraMode = useDeviceDetailStore((s) => s.propsHave['cameraMode'])
  const cameraMode = useUavControlRoomStore((s) => s.state.cameraMode)

  const postService = usePostDeviceService(productKey, deviceId)

  const disabled =
    !(hasCameraMode && videoSource === 'gimbal') || cameraMode !== '0'

  const handleClick = () => {
    if (disabled) {
      return
    }
    postService('takePhoto', {})
  }

  return (
    <IconButton
      className={borderedBtnClassName}
      toolTipProps={{ title: '拍照' }}
      disabled={disabled}
      onClick={handleClick}
    >
      <IconTakePhoto />
    </IconButton>
  )
})

TakePhoto.displayName = 'TakePhoto'

export default TakePhoto
