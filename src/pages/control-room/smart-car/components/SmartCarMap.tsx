import CesiumMap from '@/map/CesiumMap'

/** 智慧警车驾驶舱地图 */
const SmartCarMap: FC = memo(() => {
  return <CesiumMap id="smart-car-control-room" />
})

SmartCarMap.displayName = 'SmartCarMap'

export default SmartCarMap
