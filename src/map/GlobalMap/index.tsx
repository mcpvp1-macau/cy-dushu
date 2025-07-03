import DeviceMarkers from './DeviceMarkers'
import * as Cesium from 'cesium'
import CesiumGlobalPickEvent from './GlobalPickEvent'
import BigFlyListener from './BigFlyListener'
import CesiumDebug from './Debug'
import OverlayAndFlightArea from './OverlayAndFlightArea'
import OverlayEditor from './OverlayEditor'
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
import ReconstructionLayer from '../CesiumMap/components/service/ReconstructionDraw/ReconstructionLayer'
import DeferredRender from '@/components/DeferredRender'
import CesiumMap from '../CesiumMap'
import PicutreOnMap from '../CesiumMap/components/service/PictureOnMap'
import DensityMap from './DensityMap/DensityMap'
import FlightAreaEditor from './OverlayEditor/FlightAreaEditor'

type PropsType = unknown

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ACCESS_TOKEN

const GlobalMap: FC<PropsType> = memo(() => {
  return (
    <div className="absolute inset-0">
      <DeferredRender>
        <CesiumMap id="global-map">
          <UpdateMap />
          <DeviceMarkers />
          <CesiumGlobalPickEvent />
          <BigFlyListener />
          <OverlayAndFlightArea />
          <OverlayEditor />
          <FlightAreaEditor />
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
          <ReconstructionLayer />
          <PicutreOnMap />
          <DensityMap />
        </CesiumMap>
      </DeferredRender>
    </div>
  )
})

GlobalMap.displayName = 'GlobalMap'

export default GlobalMap
