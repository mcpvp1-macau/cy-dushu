import CesiumMap from '@/map/CesiumMap'
import UsvMarker from './components/UsvMarker'
import PointSail from './components/PointSail/PointSail'
import RightTools from './components/right_tools'
import UsvViewCombackResolver from './components/CombackResolver'

const UsvMap: FC = memo(() => {
  return (
    <CesiumMap id="usv-control-room">
      <RightTools />
      <UsvViewCombackResolver />
      <UsvMarker />
      <PointSail />
    </CesiumMap>
  )
})

UsvMap.displayName = 'UsvMap'

export default UsvMap
