import CesiumMap from '@/map/CesiumMap'
import SmartCarMarker from './SmartCarMarker'
import RightTools from './Map/components/right_tools'
import SmartCarViewCombackResolver from './Map/components/CombackResolver'

/** 智慧警车驾驶舱地图 */
const SmartCarMap: FC = memo(() => {
  return (
    <CesiumMap id="smart-car-control-room">
      <RightTools />
      <SmartCarViewCombackResolver />
      <SmartCarMarker />
    </CesiumMap>
  )
})

SmartCarMap.displayName = 'SmartCarMap'

export default SmartCarMap
