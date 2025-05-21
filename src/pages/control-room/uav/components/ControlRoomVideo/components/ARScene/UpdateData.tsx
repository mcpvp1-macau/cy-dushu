import {
  getGeoSearchAOIData,
  getGeoSearchPOIData,
  getGeoSearchRoadData,
} from '@/service/modules/geo'
import useMixARStore from '@/store/control-room/useMixAR.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { getOverlayColor } from '@/utils/color'
import { shouldJson } from '@/utils/json'
import * as turf from '@turf/turf'
import RBush from 'geojson-rbush'

type PropsType = unknown

/** 负责更新 GEOJSON 路网数据 */
const ARSenceUpdateData: FC<PropsType> = memo(() => {
  const uav = useMixARStore((s) => s.uavProperties)

  // 筛选距离
  const DISTANCE = 1_400 // 1 km

  const lastCoordinates = useRef<[number, number] | undefined>(undefined)
  const [range, setRange] = useState<[number, number][] | undefined>()

  const queryClient = useQueryClient()

  const { data: poiData } = useQuery(
    {
      queryKey: ['geo-search', 'poi', range],
      queryFn: () =>
        getGeoSearchPOIData({
          lng0: range![0][0],
          lat0: range![0][1],
          lng1: range![1][0],
          lat1: range![1][1],
        }),
      enabled: !!range,
      select: (d) => d.data,
    },
    queryClient,
  )

  const updatePOIsRTree = useMixARStore((s) => s.updatePOIsRTree)
  useEffect(() => {
    if (poiData) {
      const rTree = RBush<GeoJSON.Point, GeoJSON.GeoJsonProperties>()
      rTree.load(poiData)
      updatePOIsRTree(rTree)
    }
  }, [poiData])

  // AOI ========================================
  const { data: aoiData } = useQuery(
    {
      queryKey: ['geo-search', 'aoi', range],
      queryFn: () =>
        getGeoSearchAOIData({
          lng0: range![0][0],
          lat0: range![0][1],
          lng1: range![1][0],
          lat1: range![1][1],
        }),
      enabled: !!range,
      select: (d) => d.data,
    },
    queryClient,
  )

  const updateAOIsRTree = useMixARStore((s) => s.updateAOIsRTree)

  useEffect(() => {
    if (aoiData) {
      const rTree = RBush<GeoJSON.Polygon, GeoJSON.GeoJsonProperties>()
      rTree.load(aoiData)
      updateAOIsRTree(rTree)
    }
  }, [aoiData])

  // 道路 ========================================
  const { data: roadData } = useQuery(
    {
      queryKey: ['geo-search', 'road', range],
      queryFn: () =>
        getGeoSearchRoadData({
          lng0: range![0][0],
          lat0: range![0][1],
          lng1: range![1][0],
          lat1: range![1][1],
        }),
      enabled: !!range,
      select: (d) => d.data,
    },
    queryClient,
  )

  const updateRoadsRTree = useMixARStore((s) => s.updateRoadsRTree)

  useEffect(() => {
    if (roadData) {
      const rTree = RBush<GeoJSON.LineString, GeoJSON.GeoJsonProperties>()
      rTree.load(roadData)
      updateRoadsRTree(rTree)
    }
  }, [roadData])

  useEffect(() => {
    if (!uav.longitude || !uav.latitude) {
      return
    }
    const to = turf.point([uav.longitude, uav.latitude])
    if (lastCoordinates.current) {
      const from = turf.point(lastCoordinates.current)
      const distance = turf.distance(from, to, { units: 'meters' })
      if (distance < DISTANCE / 4) {
        return
      }
    }
    lastCoordinates.current = [uav.longitude, uav.latitude]
    const rt = turf.rhumbDestination(to, DISTANCE, 45, { units: 'meters' })
    const lb = turf.rhumbDestination(to, DISTANCE, 225, { units: 'meters' })
    setRange([
      [lb.geometry.coordinates[0], lb.geometry.coordinates[1]],
      [rt.geometry.coordinates[0], rt.geometry.coordinates[1]],
    ])
  }, [uav.longitude, uav.latitude])

  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)
  const updateOverlayRTree = useMixARStore((s) => s.updateOverlayRTree)
  useEffect(() => {
    const collection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    overlayList.forEach((e) => {
      if (e.overlayType === 'POSITION') {
        const position = shouldJson(e.overlayPositions)
        collection.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: position?.[0],
          },
          id: `overlay-${e.overlayId}`,
          properties: {
            name: e.overlayName,
          },
        })
      } else if (e.overlayType === 'POLYGON') {
        const positions = shouldJson(e.overlayPositions)
        positions.push(positions[0])
        collection.features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [positions],
          },
          id: `overlay-${e.overlayId}`,
          properties: {
            name: e.overlayName,
            color: getOverlayColor(shouldJson(e.overlayStyleConfig), 0.5),
          },
        })
      } else if (e.overlayType === 'CIRCULAR') {
        const positions = shouldJson(e.overlayPositions)[0]
        const f = turf.circle([positions[0], positions[1]], positions[3], {
          units: 'meters',
        })
        f.geometry.coordinates[0] = f.geometry.coordinates[0].map((item) => [
          item[0],
          item[1],
          positions[2],
        ])

        f.properties = {
          name: e.overlayName,
          color: getOverlayColor(shouldJson(e.overlayStyleConfig), 0.5),
        }
        collection.features.push(f)
      }
    })

    const rTree = RBush()
    rTree.load(collection.features)
    updateOverlayRTree(rTree)
  }, [overlayList])

  return null
})

ARSenceUpdateData.displayName = 'ARSenceUpdateData'

export default ARSenceUpdateData
