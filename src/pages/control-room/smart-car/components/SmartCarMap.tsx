import CesiumMap from '@/map/CesiumMap'
import SmartCarMarker from './SmartCarMarker'

/** 智慧警车驾驶舱地图 */
const SmartCarMap: FC = memo(() => {
  return (
    <CesiumMap id="smart-car-control-room">
      <SmartCarMarker />
    </CesiumMap>
  )
})

SmartCarMap.displayName = 'SmartCarMap'

export default SmartCarMap
