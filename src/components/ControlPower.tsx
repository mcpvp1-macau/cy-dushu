import useRobControlPower from '@/pages/control-room/uav/hooks/useRobControlPower'
import useUserStore from '@/store/useUser.store'
import { Switch } from 'antd'
import { v4 as uuidv4 } from 'uuid'

// const updateUUID = useUavControlRoomStore((s) => s.updateUUID)

type PropsType = {
  open?: boolean
  updateUUID: (uuid: string) => void
}

/** 控制权 */
const ControlPower: FC<PropsType> = memo(({ open, updateUUID }) => {
  const username = useUserStore((s) => s.user?.username)
  const { robControlPower, isPending } = useRobControlPower(updateUUID)
  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      robControlPower(
        `${username}-${dayjs().format('YYYYMMDDHHmmss')}-${uuidv4()}`,
      )
    } else {
      robControlPower('ANY')
    }
  }

  return (
    <div className="flex items-center gap-1 whitespace-nowrap">
      <span className="text-sm">控制权</span>
      <Switch
        size="small"
        checked={open}
        loading={isPending}
        onChange={handleSwitchChange}
      />
    </div>
  )
})

ControlPower.displayName = 'ControlPower'

export default ControlPower
