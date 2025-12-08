import {
  getGeoSearchAOIData,
  getGeoSearchPOIData,
  getGeoSearchRoadData,
} from '@/service/modules/geo'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import useMixARStore from '@/store/control-room/useMixAR.store'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'

import { shouldJson } from '@/utils/json'
import * as turf from '@turf/turf'
import RBush from 'geojson-rbush'
import { useShallow } from 'zustand/react/shallow'
import getHeightsFromRGBTile from '@/utils/cesium/getHeightsFromRGBTile'


type PropsType = unknown

/** 负责更新 GEOJSON 路网数据 */
const ARSenceUpdateData: FC<PropsType> = memo(() => {
  // const uav = useMixARStore((s) => s.uavProperties)

  const uav = useUavControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude ?? 0,
      latitude: s.state.latitude ?? 0,
      altitude: s.state.altitude ?? 0,
      gimbalYaw: s.state.gimbalHead ?? 0,
      gimbalPitch: s.state.gimbalPitch ?? 0,
      lensType: s.state.lensType ?? 'wide',
      zoomFactor: s.state.zoomFactor ?? 1,
      cameraType: s.state.gimbalType || s.state.cameraType,
      uavYaw: s.state.uavYaw ?? 0,
    })),
  )

  // 筛选距离
  const DISTANCE = 2_000 // 2 km

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

  // webgl渲染是有视锥裁剪的，请求的数据也是在附近的，所以无需使用rTree
  // 但是overlay可能在全球各地，所以使用rTree查找附近的

  const _updatePOIsRTree = useMixARStore((s) => s._updatePOIsRTree)
  useEffect(() => {
    if (poiData) {
      // const rTree = RBush<GeoJSON.Point, GeoJSON.GeoJsonProperties>()
      // rTree.load(poiData)
      // updatePOIsRTree(rTree)
      useMixARStore.getState().updatePOIs(poiData)
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

  const _updateAOIsRTree = useMixARStore((s) => s._updateAOIsRTree)

  useEffect(() => {
    if (aoiData) {
      // const rTree = RBush<GeoJSON.Polygon, GeoJSON.GeoJsonProperties>()
      // rTree.load(aoiData)
      // updateAOIsRTree(rTree)
      useMixARStore.getState().updateAOIs(aoiData)
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

  const _updateRoadsRTree = useMixARStore((s) => s._updateRoadsRTree)

  useEffect(() => {
    if (roadData) {
      // const rTree = RBush<GeoJSON.LineString, GeoJSON.GeoJsonProperties>()
      // rTree.load(roadData)
      // updateRoadsRTree(rTree)
      useMixARStore.getState().updateRoads(roadData)
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

      if (distance < DISTANCE / 8) {
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
  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)
  const _updateOverlayRTree = useMixARStore((s) => s._updateOverlayRTree)
  useEffect(() => {
    if (!range) {
      return
    }

    const collection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    const combineOverlays = [...flightAreaList, ...overlayList]

    combineOverlays.forEach((e) => {
      if (e.overlayType === 'POSITION') {
        const position = shouldJson(e.overlayPositions)
        collection.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: position?.[0],
          },
          id: `overlay-${e.overlayId}`,
          properties: { ...e },
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
          id: e.overlayExtType
            ? `flightArea-${e.overlayId}`
            : `overlay-${e.overlayId}`,
          properties: { ...e },
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
        f.id = e.overlayExtType
          ? `flightArea-${e.overlayId}`
          : `overlay-${e.overlayId}`

        f.properties = { ...e }
        collection.features.push(f)
      }
    })

    const rTree = RBush()
    rTree.load(collection.features)
    // updateOverlayRTree(rTree)
    const lb = range[0]
    const rt = range[1]
    const rangeRect = [
      [lb[0], lb[1]],
      [lb[0], rt[1]],
      [rt[0], rt[1]],
      [rt[0], lb[1]],
      [lb[0], lb[1]],
    ]
    const features = rTree.search(turf.polygon([rangeRect]))

    const coordinates: GeoJSON.Position[] = features.features.map((feature) => {
      if (feature.geometry.type === 'Point') {
        return feature.geometry.coordinates
      } else if (feature.geometry.type === 'Polygon') {
        return feature.geometry.coordinates[0][0]
      }
      return []
    })

    getHeightsFromRGBTile(coordinates as [number, number][]).then((heights) => {
      features.features.forEach((feature, index) => {
        const overlay = feature.properties as API_LAYER_OVERLAY.domain.Overlay
        const positions = shouldJson(overlay.overlayPositions) as number[][]
        const height = heights[index]

        positions.forEach((position) => {
          position[2] = height
        })
        overlay.overlayPositions = JSON.stringify(positions)
      })
      useMixARStore.getState().updateOverlaies(features)
    })
  }, [overlayList, flightAreaList, range])

  return null
})

ARSenceUpdateData.displayName = 'ARSenceUpdateData'

export default ARSenceUpdateData
