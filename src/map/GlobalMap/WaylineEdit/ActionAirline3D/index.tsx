import HomePoint from './HomePoint'
import AddAirPoint from './AddAirPoint'
import AirPoints from './AirPoints'
import { useMouseStyle } from './hooks/useMouseStyle'
import { useCancelSetPoint } from './hooks/useCancelSetPoint'
import MenuBox from './MenuBox'
import UavPoint from './UavPoint'
import RoadTargetPoint from './RoadTargetPoint'

type PropsType = unknown

const ActionAirline: FC<PropsType> = () => {
  useMouseStyle()
  useCancelSetPoint()

  return (
    <>
      <HomePoint />
      <RoadTargetPoint />
      <AirPoints />
      <AddAirPoint />
      <MenuBox />
      <UavPoint />
    </>
  )
}

export default ActionAirline
