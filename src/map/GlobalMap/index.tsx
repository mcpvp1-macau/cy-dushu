import DeviceMarkers from './DeviceMarkers'
import * as Cesium from 'cesium'
import CesiumGlobalPickEvent from './GlobalPickEvent'
import RightPick from './RightPick'
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
import Reconstruction2D from '../CesiumMap/components/service/Reconstruction2D/Reconstruction2D'
import Reconstruction2DResultList from '../CesiumMap/components/service/Reconstruction2D/Reconstruction2DResultList'
import BottomSafeArea from './BottomSafeArea'
// import Demo from './Test'

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
          <RightPick />
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
          <Reconstruction2D />
          <Reconstruction2DResultList />
          <BottomSafeArea />
          {/* <Demo /> */}
        </CesiumMap>
      </DeferredRender>
    </div>
  )
})

GlobalMap.displayName = 'GlobalMap'

export default GlobalMap
