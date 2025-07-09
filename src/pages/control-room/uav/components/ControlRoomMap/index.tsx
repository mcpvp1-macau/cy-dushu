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
import Reconstruction2D from '@/map/CesiumMap/components/service/Reconstruction2D/Reconstruction2D'
import { getReconstruction2DList } from '@/service/modules/reconstruction'
import useReconstruction2DMapStore, {
  ProcessedResultType,
} from '@/store/map/useReconstruction2DMap.store'
import { isNil } from 'lodash'
import { getGimbalInfo } from '@/constant/uav/gimbalV2'

type PropsType = unknown

const UavReconstruction = lazy(
  () => import('./components/Reconstruction/index'),
)

const ControlRoomUavMap: FC<PropsType> = memo(() => {
  const isResetHome = useUavControlRoomStore((s) => s.flyParams.isResetHome)

  const enableReconstruction = useUavControlRoomStore(
    (s) => s.enableReconstruction,
  )

  // 热力图相关 --------------------------------------------------------------------
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const densityMapExpiration = useDensityMapStore((s) => s.densityMapExpiration)
  useGetDensityStatistics({
    deviceId: deviceId,
    expireTime: densityMapExpiration,
  })

  useListenRealDensityMap((id) => {
    return id === deviceId
  })

  // 二维重建 ---------------------------------------------------------------------
  const queryClient = useQueryClient()
  const { data: data2dList } = useQuery(
    {
      queryKey: ['reconstruction2dList', { deviceId }],
      queryFn: () => getReconstruction2DList({ deviceId, needProcess: true }),
      select: (d) => d.data,
    },
    queryClient,
  )
  useEffect(() => {
    if (!data2dList?.length) {
      return
    }
    if (data2dList[0].process && data2dList[0].status === '"PROCESSING"') {
      const processedResults: ProcessedResultType[] = []
      for (const item of data2dList.at(-1)!.process ?? []) {
        if (item.imageType === 'tiff') {
          processedResults.length = 0
          processedResults.push({
            imgUrl: item.imageUrl,
            lon: 0,
            lat: 0,
            alt: 0,
            yaw: 0,
            pitch: 0,
            roll: 0,
            focal: 0,
            width: 0,
            aspectRatio: 1,
            zoomFactor: 1,
            imgType: 'tiff',
          })
          continue
        }
        const meta = item.meta || {}
        if (
          isNil(meta.gpsLongitude) ||
          isNil(meta.gpsLatitude) ||
          isNil(meta.gimbalPitch) ||
          isNil(meta.gimbalYaw) ||
          isNil(meta.gimbalRoll) ||
          isNil(meta.productName) ||
          isNil(meta.absoluteAltitude)
        ) {
          continue
        }
        const g = getGimbalInfo(meta.productName)
        processedResults.push({
          imgUrl: item.imageUrl,
          lon: meta.gpsLongitude,
          lat: meta.gpsLatitude,
          alt: meta.absoluteAltitude,
          yaw: meta.gimbalYaw,
          pitch: meta.gimbalPitch,
          roll: meta.gimbalRoll,
          focal: g.wide.focal,
          width: g.wide.width,
          aspectRatio: g.wide.width / g.wide.height,
          zoomFactor: 1,
          imgType: 'jpeg',
        })
      }
      useReconstruction2DMapStore
        .getState()
        .updateProcessedResults(processedResults)
    }
  }, [data2dList])

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
      <Reconstruction2D />
    </CesiumMap>
  )
})

ControlRoomUavMap.displayName = 'ControlRoomUavMap'

export default ControlRoomUavMap
