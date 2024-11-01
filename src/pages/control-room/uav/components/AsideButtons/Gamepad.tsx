import IconGamepad from '@/assets/icons/jsx/uav/IconGamepad'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { checkGamepad, checkUavIsZero } from '@/utils/gamepad'
import { Button } from 'antd'
import useGamepad from '../../hooks/useGamepad'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = unknown

const GamePadUser = () => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const limitedFly = useUavControlRoomStore((s) => s.isLimitedFly)
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)

  const serviceHas = useDeviceDetailStore((s) => s.serviceHave)

  useGamepad(
    productKey,
    deviceId,
    hasControlPower && serviceHas['moveUav'] && !limitedFly,
    !limitedFly,
  )
  return null
}

/** 摇杆 */
const Gamepad: FC<PropsType> = memo(() => {
  const enableGamepad = useUavControlRoomStore((s) => s.enableGamepad)
  const updateEnableGamepad = useUavControlRoomStore(
    (s) => s.updateEnableGamepad,
  )
  const msgApi = useAppMsg()
  const updateUavControlInfo = useUavControlRoomStore(
    (s) => s.updateUavControlInfo,
  )
  const updateGimbalControlInfo = useUavControlRoomStore(
    (s) => s.updateGimbalControlInfo,
  )
  // useEffect(() => {}, [enableGamepad])

  return (
    <>
      <Button
        className="grow h-[26px] px-0"
        icon={<IconGamepad />}
        type={enableGamepad ? 'primary' : 'default'}
        onClick={() => {
          if (enableGamepad) {
            updateEnableGamepad(false)
            updateUavControlInfo({
              x: 0,
              y: 0,
              z: 0,
              yaw: 0,
            })
            updateGimbalControlInfo({
              pitch: 0,
              yaw: 0,
            })
            return
          }
          if (!checkGamepad()) {
            msgApi.error('未检测到摇杆设备')
            return
          }
          if (!checkUavIsZero()) {
            msgApi.error('请将摇杆置于中位')
            return
          }
          updateEnableGamepad(true)
        }}
      >
        摇杆
      </Button>
      {enableGamepad && <GamePadUser />}
    </>
  )
})

Gamepad.displayName = 'Gamepad'

export default Gamepad
