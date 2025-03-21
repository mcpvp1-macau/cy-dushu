import HomePoint from './HomePoint'
import AddAirPoint from './AddAirPoint'
import AirPoints from './AirPoints'
import { useMouseStyle } from './hooks/useMouseStyle'
import { useCancelSetPoint } from './hooks/useCancelSetPoint'
import MenuBox from './MenuBox'
import UavPoint from './UavPoint'

type PropsType = unknown

const ActionAirline: FC<PropsType> = () => {
  useMouseStyle()
  useCancelSetPoint()

  return (
    <>
      <HomePoint />
      <AirPoints />
      <AddAirPoint />
      <MenuBox />
      <UavPoint />
    </>
  )
}

export default ActionAirline
