import CesiumMap from '@/map/CesiumMap'
import UsvMarker from './components/UsvMarker'

const UsvMap: FC = memo(() => {
  return (
    <CesiumMap id="usv-control-room">
      <UsvMarker />
    </CesiumMap>
  )
})

UsvMap.displayName = 'UsvMap'

export default UsvMap
