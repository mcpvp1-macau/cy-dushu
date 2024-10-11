import PositionPickListener from '@/components/map/PositionPickListener'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import UavPointFlyTarget from './Target'
import UavPointFlyConfirm from './Confirm'
import PointFlyForecast from './Forecast'

type PropsType = unknown

/** 指点飞行 */
const UavMapPointFly: FC<PropsType> = memo(() => {
  const openPointFly = useUavControlRoomStore((s) => s.openPointFly)

  const [position, setPosition] = useState<[number, number] | null>(null)

  const displayMode = useUavControlRoomStore((s) => s.state.displayMode)

  const handleClick = (longitude: number, latitude: number) => {
    setPosition([longitude, latitude])
  }

  const isPointFlying = displayMode?.startsWith('指点飞行')

  // 关闭指点飞行时清除位置
  useEffect(() => {
    if (!openPointFly) {
      setPosition(null)
    }
  }, [openPointFly])

  return (
    <>
      {openPointFly && <PositionPickListener onClick={handleClick} />}
      {position && <UavPointFlyTarget position={position} />}
      {openPointFly && position && (
        <UavPointFlyConfirm
          position={position}
          onAction={() => setPosition(null)}
        />
      )}
      {isPointFlying && <PointFlyForecast />}
    </>
  )
})

UavMapPointFly.displayName = 'UavMapPointFly'

export default UavMapPointFly
