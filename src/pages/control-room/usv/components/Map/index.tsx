import CesiumMap from '@/map/CesiumMap'
import UsvMarker from './components/UsvMarker'
import PointSail from './components/PointSail/PointSail'

const UsvMap: FC = memo(() => {
  return (
    <CesiumMap id="usv-control-room">
      <UsvMarker />
      <PointSail />
    </CesiumMap>
  )
})

UsvMap.displayName = 'UsvMap'

export default UsvMap
