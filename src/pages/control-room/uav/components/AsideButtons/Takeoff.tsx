import IconTakeoff from '@/assets/icons/jsx/uav/IconTakeoff'
import VerticalIconButton from '@/components/ui/button/VerticalButton'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'

type PropsType = {
  postServiceFn: (identifier: string, data?: any) => Promise<void>
}

/** 一键起飞 */
const Takeoff: FC<PropsType> = memo(({ postServiceFn }) => {
  const isLimitedFly = useUavControlRoomStore((s) => s.isLimitedFly)
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)
  const hasService = useDeviceDetailStore((s) => s.serviceHave['takeoff'])

  const canTakeoff = !isLimitedFly && hasControlPower && hasService

  const handleClick = async () => {
    console.log('TODO')
  }

  return (
    <VerticalIconButton
      className="flex-1 h-10 p-0 text-xs"
      disabled={!canTakeoff}
      icon={<IconTakeoff className="text-base" />}
      onClick={handleClick}
    >
      一键起飞
    </VerticalIconButton>
  )
})

Takeoff.displayName = 'Takeoff'

export default Takeoff
