import { Button } from 'antd'
import { v4 as uuidv4 } from 'uuid'
import useRobControlPower from '@/pages/right/DeviceDetail/hooks/useRobControlPower'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import DeviceIconRebotDog from '@/assets/icons/jsx/device/DeviceIconRebotDog'

type PropsType = unknown

const ControlPower: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const updateUUID = useRebotDogControlRoomStore((s) => s.updateUUID)
  const { robControlPower, isPending, disabled } =
    useRobControlPower(updateUUID)
  const operator = useRebotDogControlRoomStore((s) => s.state.operator)
  const hasControlPower = useRebotDogControlRoomStore((s) => s.hasControlPower)

  return (
    <Button
      block
      className="h-[26px]"
      icon={<DeviceIconRebotDog />}
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
