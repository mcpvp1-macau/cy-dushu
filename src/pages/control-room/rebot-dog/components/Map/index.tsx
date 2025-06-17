import CesiumMap from '@/map/CesiumMap'
import RebotDogRealMarker from './components/RealMarker'
import RebotDogRealTrack from './components/RealTrack'
import TargetPoints from '@/map/GlobalMap/TargetPoints'
const RebotDogMap: FC<unknown> = memo(() => {
  return (
    <CesiumMap id="rebot-dog-control-room-map">
      <RebotDogRealMarker />
      <RebotDogRealTrack />
      <TargetPoints />
    </CesiumMap>
  )
})

RebotDogMap.displayName = 'RebotDogMap'

export default RebotDogMap
