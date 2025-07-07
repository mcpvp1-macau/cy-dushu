import CesiumMap from '@/map/CesiumMap'
import { lazy } from 'react'
import UavMarker from './components/UavMarker'
import ResetHomePointListener from './components/ResetHomePointListener'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import HomeMarker from './components/HomeMarker'
import UavMapInitial from './components/Initial'
import UavRealTrack from './components/RealTrack'
import UavMapPointFly from './components/PointFly/PointFly'
import UavViewCombackResolver from './components/CombackResolver'
import LastestTask from './components/AirlineTaskInfo/LatestTask'
import UAVControlRoomPOIResolver from './components/POIResolver'
import LayerOverlay from './components/LayerOverlaies'
import RightTools from './components/right_tools'
import Right from './components/right_details'
import DrawHandler from '@/map/GlobalMap/DrawHandler'
import MapSituation from '@/map/GlobalMap/Situation'
import TargetPoints from '@/map/GlobalMap/TargetPoints'
import LeftTopTools from './components/LeftTopTools'
import ReconstructionLayer from '@/map/CesiumMap/components/service/ReconstructionDraw/ReconstructionLayer'
import EventMarkers from '@/map/GlobalMap/EventMarkers'
import PickEvent from './components/PickEvent'
import PicutreOnMap from '@/map/CesiumMap/components/service/PictureOnMap'
import CitySituation from './components/CitySituation/CitySituation'
import DensityMap from '@/map/GlobalMap/DensityMap/DensityMap'
import useDensityMapStore, {
  useGetDensityStatistics,
  useListenRealDensityMap,
} from '@/store/map/useDensityMap.store'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = unknown

const UavReconstruction = lazy(
  () => import('./components/Reconstruction/index'),
)

const ControlRoomUavMap: FC<PropsType> = memo(() => {
  const isResetHome = useUavControlRoomStore((s) => s.flyParams.isResetHome)

  const enableReconstruction = useUavControlRoomStore(
    (s) => s.enableReconstruction,
  )

  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const densityMapExpiration = useDensityMapStore((s) => s.densityMapExpiration)
  useGetDensityStatistics({
    deviceId: deviceId,
    expireTime: densityMapExpiration,
  })
  useListenRealDensityMap((id) => id === deviceId)

  return (
    <CesiumMap id="uav-control-room-map">
      <LeftTopTools />
      <RightTools />
      <Right />
      <DrawHandler />
      <MapSituation />
      <UavMapPointFly />
      <UavViewCombackResolver />
      <LastestTask />
      {isResetHome && <ResetHomePointListener />}
      <UavMapInitial />
      <UavMarker />
      <HomeMarker />
      <UavRealTrack />
      <UAVControlRoomPOIResolver />
      <LayerOverlay />
      <TargetPoints />
      <CitySituation />
      {enableReconstruction && <UavReconstruction />}
      <ReconstructionLayer />
      <EventMarkers />
      <PickEvent />
      <PicutreOnMap />
      <DensityMap />
    </CesiumMap>
  )
})

ControlRoomUavMap.displayName = 'ControlRoomUavMap'

export default ControlRoomUavMap
