import CesiumMap from '@/map/CesiumMap'
import RebotDogRealMarker from './components/RealMarker'
import RebotDogRealTrack from './components/RealTrack'
const RebotDogMap: FC<unknown> = memo(() => {
  return (
    <CesiumMap id="rebot-dog-control-room-map">
      <RebotDogRealMarker />
      <RebotDogRealTrack />
    </CesiumMap>
  )
})

RebotDogMap.displayName = 'RebotDogMap'

export default RebotDogMap
