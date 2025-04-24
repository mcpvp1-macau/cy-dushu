import AddPoint from './components/AddPoint'
import Waypoints from './components/Waypoints'
import { useCancelSetPoint } from './hooks/useCancelSetPoint'
import { useMouseStyle } from './hooks/useMouseStyle'

type PropsType = unknown

const RebotDogWayline: FC<PropsType> = memo(() => {
  useMouseStyle()
  useCancelSetPoint()

  return (
    <>
      <AddPoint />
      <Waypoints />
    </>
  )
})

RebotDogWayline.displayName = 'RebotDogWayline'

export default RebotDogWayline
