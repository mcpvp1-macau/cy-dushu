import PositionPickListener from '@/components/map/PositionPickListener'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import UavPointFlyTarget from './Target'
import UavPointFlyConfirm from './Confirm'
import PointFlyForecast from './Forecast'

type PropsType = unknown

/** 指点飞行 */
const UavMapPointFly: FC<PropsType> = memo(() => {
  const pointFly = useUavControlRoomStore((s) => s.pointFly)
  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)

  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)

  const handleClick = (longitude: number, latitude: number) => {
    updatePointFly({ targetPosition: [longitude, latitude], open: true })
  }

  const isPointFlying = displayMode?.startsWith('指点飞行')

  return (
    <>
      {pointFly.open && <PositionPickListener onClick={handleClick} />}
      {pointFly.targetPosition && (
        <UavPointFlyTarget position={pointFly.targetPosition} />
      )}
      {pointFly.open && pointFly.targetPosition && (
        <UavPointFlyConfirm position={pointFly.targetPosition} />
      )}
      {isPointFlying && <PointFlyForecast />}
    </>
  )
})

UavMapPointFly.displayName = 'UavMapPointFly'

export default UavMapPointFly
