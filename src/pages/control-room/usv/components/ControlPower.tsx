import IconUSV from '@/assets/icons/jsx/IconUSV'
import useRobControlPower from '@/pages/right/DeviceDetail/hooks/useRobControlPower'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import { Button } from 'antd'
import { v4 as uuidv4 } from 'uuid'

type PropsType = unknown

const ControlPower: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const updateUUID = useUsvControlRoomStore((s) => s.updateUUID)
  const operator = useUsvControlRoomStore((s) => s.state?.operator)
  const hasControlPower = useUsvControlRoomStore((s) => s.hasControlPower)

  const { robControlPower, isPending, disabled } =
    useRobControlPower(updateUUID)

  const handleClick = useMemoizedFn(() => {
    // 业务规则：已占有时点击释放控制权，未占有时抢占控制权
    if (hasControlPower) {
      robControlPower('ANY')
      return
    }

    robControlPower(uuidv4())
  })

  return (
    <Button
      icon={<IconUSV />}
      loading={isPending}
      disabled={disabled}
      type={hasControlPower ? 'primary' : 'default'}
      onClick={handleClick}
    >
      {t('device.controlPower.title')}
      {operator ? ` (${operator})` : ''}
    </Button>
  )
})

ControlPower.displayName = 'ControlPower'

export default ControlPower
