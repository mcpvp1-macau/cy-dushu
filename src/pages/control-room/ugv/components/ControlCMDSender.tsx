import { useUGVControlRoomStore } from '@/store/context-store/useUGVControlRoom.store'
import { useRafInterval } from 'ahooks'

const ControlRoomUGVCmdSender: FC = memo(() => {
  const controlInfo = useUGVControlRoomStore((s) => s.controlInfo)
  const sendCommand = useUGVControlRoomStore((s) => s.sendCommand)

  const payload = useMemo(() => {
    const nextPayload = {
      xSpeed: controlInfo.xSpeed ?? 0,
      yawSpeed: controlInfo.yawSpeed ?? 0,
    }

    const hasValue = Object.values(nextPayload).some(
      (value) => Math.abs(value) > 1e-4,
    )
    return hasValue ? nextPayload : undefined
  }, [controlInfo.xSpeed, controlInfo.yawSpeed])

  useRafInterval(() => {
    sendCommand('service.moveUgv.post', payload)
  }, payload ? 50 : undefined)

  return null
})

ControlRoomUGVCmdSender.displayName = 'ControlRoomUGVCmdSender'

export default ControlRoomUGVCmdSender
