import DeviceMarkers from './DeviceMarkers'
import * as Cesium from 'cesium'
import CesiumGlobalPickEvent from './GlobalPickEvent'
import BigFlyListener from './BigFlyListener'
import CesiumDebug from './Debug'
import CesiumMap from '../CesiumMap'
import ActionAirline from './ActionAirline3D'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import LayerOverlay from './LayerOverlay'
import MapSituation from './Situation'
import MapViewSave from './MapViewSave'
import DrawHandler from './DrawHandler'
import DeviceHistoryTracks from './DeviceHistoryTracks'

type PropsType = unknown

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN

const GlobalMap: FC<PropsType> = memo(() => {
  const airlineOpen = useAirlineConfigStore((s) => s.open)

  return (
    <div className="absolute inset-0">
      <CesiumMap id="global-map">
        <DeviceMarkers />
        <CesiumGlobalPickEvent />
        <BigFlyListener />
        <LayerOverlay />
        <CesiumDebug />
        <MapSituation />
        <MapViewSave />
        <DrawHandler />
        <DeviceHistoryTracks />
        {airlineOpen && <ActionAirline />}
      </CesiumMap>
    </div>
  )
})

GlobalMap.displayName = 'GlobalMap'

export default GlobalMap
