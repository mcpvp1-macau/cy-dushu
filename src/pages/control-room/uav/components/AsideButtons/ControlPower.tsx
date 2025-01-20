import DeviceIconUAV2 from '@/assets/icons/jsx/device/DeviceIconUAV2'
import { Button } from 'antd'
import { memo, type FC } from 'react'
import useRobControlPower from '../../hooks/useRobControlPower'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useUserStore from '@/store/useUser.store'
import { v4 as uuidv4 } from 'uuid'
// const updateUUID = useUavControlRoomStore((s) => s.updateUUID)
type PropsType = unknown

const ControlPower: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const username = useUserStore((s) => s.user?.username)
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
          robControlPower(
            `${username}-${dayjs().format('YYYYMMDDHHmmss')}-${uuidv4()}`,
          )
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
