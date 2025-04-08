import DeviceMarkers from './DeviceMarkers'
import * as Cesium from 'cesium'
import CesiumGlobalPickEvent from './GlobalPickEvent'
import BigFlyListener from './BigFlyListener'
import CesiumDebug from './Debug'
import CesiumMap from '../CesiumMap'
import LayerOverlay from './LayerOverlay'
import MapSituation from './Situation'
import MapViewSave from './MapViewSave'
import DrawHandler from './DrawHandler'
import DeviceHistoryTracks from './DeviceHistoryTracks'
import UpdateMap from './UpdateMap'
import TargetPoints from './TargetPoints'
import BoardCesium from './BoardCesium'
import EventMarkers from './EventMarkers'
import WaylineEdit from './WaylineEdit'
import Waylines from './Waylines'
import { lazy } from 'react'

const ReconstructionDraw = lazy(
  () => import('@/map/CesiumMap/components/service/ReconstructionDraw'),
)

type PropsType = unknown

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN

const GlobalMap: FC<PropsType> = memo(() => {
  return (
    <div className="absolute inset-0">
      <CesiumMap id="global-map">
        <UpdateMap />
        <DeviceMarkers />
        <CesiumGlobalPickEvent />
        <BigFlyListener />
        <LayerOverlay />
        <CesiumDebug />
        <MapSituation />
        <MapViewSave />
        <DrawHandler />
        <DeviceHistoryTracks />
        <TargetPoints />
        <BoardCesium />
        <EventMarkers />
        <WaylineEdit />
        <Waylines />
        <ReconstructionDraw />
      </CesiumMap>
    </div>
  )
})

GlobalMap.displayName = 'GlobalMap'

export default GlobalMap
