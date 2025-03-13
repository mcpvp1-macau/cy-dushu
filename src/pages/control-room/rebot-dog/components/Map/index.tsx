import CesiumMap from '@/map/CesiumMap'
import RebotDogRealMarker from './components/RealMarker'

const RebotDogMap: FC<unknown> = memo(() => {
  return (
    <CesiumMap id="rebot-dog-control-room-map">
      <RebotDogRealMarker />
    </CesiumMap>
  )
})

RebotDogMap.displayName = 'RebotDogMap'

export default RebotDogMap
