import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import { Switch } from 'antd'

const MMC_Gimbal_D4: React.FC = () => {
  // const productKey = useUavControlRoomStore((s) => s.productKey)
  const productKey = useDeviceDetailStore(
    (s) =>
      s.deviceDetail?.productKey || s.deviceDetail?.deviceModel?.productKey,
  )!
  const deviceId = useRebotDogControlRoomStore((s) => s.deviceId)
  const postSerivce = usePostDeviceService(productKey, deviceId)
  const throwerMotorBack = useRebotDogControlRoomStore(
    (s) => s.state.throwerMotorBack,
  )
  const throwerMotorRight = useRebotDogControlRoomStore(
    (s) => s.state.throwerMotorRight,
  )
  const throwerMotorLeft = useRebotDogControlRoomStore(
    (s) => s.state.throwerMotorLeft,
  )
  const throwerMotorFront = useRebotDogControlRoomStore(
    (s) => s.state.throwerMotorFront,
  )

  const handleClick = (position: number, action: 'open' | 'close') => {
    postSerivce('throwerControl', {
      position,
      action,
    })
  }

  const renderButton = (position: number, value: 0 | 1, label: string) => {
    return (
      <div className="flex items-center">
        <span className="mr-[20px]">{label}</span>
        <Switch
          checkedChildren="开启"
          unCheckedChildren="关闭"
          checked={value === 1}
          size="small"
          onChange={(v) => handleClick(position, v ? 'open' : 'close')}
        />
      </div>
    )
  }

  return (
    <div className="flex justify-between pl-[12px] pr-[12px] mb-[12px] pt-[12px]">
      <div className="text-center space-y-[10px]">
        {renderButton(1, throwerMotorLeft, '左抛投')}
        {renderButton(3, throwerMotorRight, '右抛投')}
      </div>
      <div className="text-center  space-y-[10px]">
        {renderButton(0, throwerMotorFront, '前抛投')}
        {renderButton(2, throwerMotorBack, '后抛投')}
      </div>
    </div>
  )
}

export default MMC_Gimbal_D4
