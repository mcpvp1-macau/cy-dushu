import CesiumMap from '@/map/CesiumMap'
import RobotDogMarker from './components/RobotDogMarker'
import DeviceSwitch from './components/DeviceSwitch'

type PropsType = unknown

const RebotDogMapWGS84: FC<PropsType> = memo(() => {
  return (
    <CesiumMap id="robot-dog-control-room">
      <DeviceSwitch />
      <RobotDogMarker />
    </CesiumMap>
  )
})

RebotDogMapWGS84.displayName = 'RebotDogMapWGS84'
export default RebotDogMapWGS84
