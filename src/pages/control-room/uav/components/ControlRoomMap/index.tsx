import CesiumMap from '@/map/CesiumMap'
import { lazy, Suspense } from 'react'
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
import { useSearchParams } from 'react-router-dom'
import TargetPoints from '@/map/GlobalMap/TargetPoints'
import LeftTopTools from './components/LeftTopTools'
import ReconstructionLayer from '@/map/CesiumMap/components/service/ReconstructionDraw/ReconstructionLayer'
import EventMarkers from '@/map/GlobalMap/EventMarkers'
import PickEvent from './components/PickEvent'
type PropsType = unknown

const RIDTargets = lazy(() => import('./components/RIDTargets'))

const UavReconstruction = lazy(
  () => import('./components/Reconstruction/index'),
)

const ControlRoomUavMap: FC<PropsType> = memo(() => {
  const isResetHome = useUavControlRoomStore((s) => s.flyParams.isResetHome)

  const enableReconstruction = useUavControlRoomStore(
    (s) => s.enableReconstruction,
  )

  const [searchParams] = useSearchParams()

  const ridsStr = searchParams.get('rids')
  const rids = ridsStr ? ridsStr.split(',') : []

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
      <Suspense fallback={null}>
        {rids.length > 0 && <RIDTargets targetIds={rids} />}
      </Suspense>
      {enableReconstruction && <UavReconstruction />}
      <ReconstructionLayer />
      <EventMarkers />
      <PickEvent />
    </CesiumMap>
  )
})

ControlRoomUavMap.displayName = 'ControlRoomUavMap'

export default ControlRoomUavMap
