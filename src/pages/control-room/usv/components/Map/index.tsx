import CesiumMap from '@/map/CesiumMap'
import UsvMarker from './components/UsvMarker'
import PointSail from './components/PointSail/PointSail'
import RightTools from './components/right_tools'
import UsvViewCombackResolver from './components/CombackResolver'
import UsvRealTrack from './components/RealTrack'

const UsvMap: FC = memo(() => {
  return (
    <CesiumMap id="usv-control-room">
      <RightTools />
      <UsvViewCombackResolver />
      <UsvMarker />
      <UsvRealTrack />
      <PointSail />
    </CesiumMap>
  )
})

UsvMap.displayName = 'UsvMap'

export default UsvMap
