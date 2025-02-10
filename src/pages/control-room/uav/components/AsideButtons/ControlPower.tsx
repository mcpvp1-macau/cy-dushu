import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import { Button } from 'antd'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { v4 as uuidv4 } from 'uuid'
import useRobControlPower from '@/pages/right/DeviceDetail/hooks/useRobControlPower'
type PropsType = unknown

const ControlPower: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const updateUUID = useUavControlRoomStore((s) => s.updateUUID)
  const { robControlPower, isPending, disabled } =
    useRobControlPower(updateUUID)
  const operator = useUavControlRoomStore((s) => s.state.operator)
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)

  return (
    <Button
      block
      className="h-[26px]"
      icon={<DeviceIconUAV2 />}
      loading={isPending}
      disabled={disabled}
      type={hasControlPower ? 'primary' : 'default'}
      onClick={() => {
        if (hasControlPower) {
          robControlPower('ANY')
        } else {
          robControlPower(uuidv4())
        }
      }}
    >
      {t('device.controlPower.title')}
      {operator && ` (${operator})`}
    </Button>
  )
})

ControlPower.displayName = 'ControlPower'

export default ControlPower
