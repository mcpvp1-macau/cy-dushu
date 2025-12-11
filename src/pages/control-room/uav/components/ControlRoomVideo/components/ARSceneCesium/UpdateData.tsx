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
import { attempt, isError } from 'lodash'
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

  // 请求附近兴趣点（POI）数据
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

  const _updatePOIsRTree = useMixARStore((s) => s.updatePOIsRTree)
  useEffect(() => {
    if (poiData) {
      // const rTree = RBush<GeoJSON.Point, GeoJSON.GeoJsonProperties>()
      // rTree.load(poiData)
      // updatePOIsRTree(rTree)
      useMixARStore.getState().updatePOIs(poiData)
    }
  }, [poiData])

  // AOI ========================================
  // 请求附近区域（AOI）数据
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

  const _updateAOIsRTree = useMixARStore((s) => s.updateAOIsRTree)

  useEffect(() => {
    if (aoiData) {
      // const rTree = RBush<GeoJSON.Polygon, GeoJSON.GeoJsonProperties>()
      // rTree.load(aoiData)
      // updateAOIsRTree(rTree)
      useMixARStore.getState().updateAOIs(aoiData)
    }
  }, [aoiData])

  // 道路 ========================================
  // 请求附近道路数据
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

  const _updateRoadsRTree = useMixARStore((s) => s.updateRoadsRTree)

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
    // 仅当飞行器位移超过阈值时才触发新的范围计算，避免频繁请求
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
  const _updateOverlayRTree = useMixARStore((s) => s.updateOverlayRTree)
  useEffect(() => {
    if (!range) {
      return
    }

    const collection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    
    // 合并飞行区和自定义覆盖物，统一校验与处理
    const combineOverlays = [...flightAreaList, ...overlayList]

    // 检查坐标数组是否合法，确保长度和数值类型正确
    const isValidPosition = (pos: unknown, minLength = 2): pos is number[] =>
      Array.isArray(pos) && pos.length >= minLength && pos.every((n) => typeof n === 'number' && Number.isFinite(n))

    combineOverlays.forEach((e) => {
      // overlayPositions 可能为字符串或空值，使用 attempt 兜底解析
      const parsedPositions = attempt(() => shouldJson(e.overlayPositions))

      if (isError(parsedPositions)) {
        return
      }

      if (e.overlayType === 'POSITION') {
        // 点覆盖物需至少包含一个合法坐标
        const firstPosition = Array.isArray(parsedPositions) ? parsedPositions[0] : undefined

        if (!isValidPosition(firstPosition)) {
          return
        }

        collection.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: firstPosition,
          },
          id: `overlay-${e.overlayId}`,
          properties: { ...e },
        })
      } else if (e.overlayType === 'POLYGON') {
        // 多边形至少包含三个点，缺失的点直接过滤
        const ring = Array.isArray(parsedPositions)
          ? (parsedPositions.filter((pos) => isValidPosition(pos)) as number[][])
          : []

        if (ring.length < 3) {
          return
        }

        ring.push([...ring[0]])
        collection.features.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [ring],
          },
          id: e.overlayExtType
            ? `flightArea-${e.overlayId}`
            : `overlay-${e.overlayId}`,
          properties: { ...e },
        })
      } else if (e.overlayType === 'CIRCULAR') {
        // 圆形数据需包含经纬高与正半径
        const circlePosition = Array.isArray(parsedPositions) ? parsedPositions[0] : undefined

        if (!isValidPosition(circlePosition, 4)) {
          return
        }

        const [longitude, latitude, height, radius] = circlePosition

        if (radius <= 0) {
          return
        }

        const f = turf.circle([longitude, latitude], radius, {
          units: 'meters',
        })
        f.geometry.coordinates[0] = f.geometry.coordinates[0].map((item) => [item[0], item[1], height])
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

    const featureCoordinates = features.features
      .map((feature) => {
        const coords = attempt(() => {
          const geometry = turf.getGeom(feature as GeoJSON.Feature<GeoJSON.Geometry>)

          if (geometry?.type === 'Point') {
            return geometry.coordinates
          }
          if (geometry?.type === 'Polygon') {
            return geometry.coordinates?.[0]?.[0]
          }
          if (geometry?.type === 'LineString') {
            return geometry.coordinates?.[0]
          }
          if (geometry?.type === 'MultiPolygon') {
            return geometry.coordinates?.[0]?.[0]?.[0]
          }
          if (geometry?.type === 'MultiLineString') {
            return geometry.coordinates?.[0]?.[0]
          }

          return turf.getCoord(feature as GeoJSON.Feature<GeoJSON.Point>)
        })

        if (isError(coords) || !coords?.length) {
          return undefined
        }

        return { feature, coord: coords as GeoJSON.Position }
      })
      .filter(Boolean) as { feature: GeoJSON.Feature; coord: GeoJSON.Position }[]

    if (!featureCoordinates.length) {
      return
    }

    // 根据 RGB 高程瓦片获取覆盖物基准高度，防止直接使用 0 高度导致贴地异常
    getHeightsFromRGBTile(featureCoordinates.map((item) => item.coord) as [number, number][]).then(
      (heights) => {
        if (!Array.isArray(heights) || !heights.length) {
          return
        }

        featureCoordinates.forEach((item, index) => {
          const overlay = item.feature.properties as API_LAYER_OVERLAY.domain.Overlay
          const positions = shouldJson(overlay.overlayPositions) as number[][]
          const height = heights[index]

          // 高程返回数量可能不足，超出部分不处理以避免越界
          if (Array.isArray(positions) && typeof height === 'number' && Number.isFinite(height)) {
            // 补齐覆盖物的高度字段，失败时保持原值
            positions.forEach((position) => {
              position[2] = height
            })
          }
          overlay.overlayPositions = JSON.stringify(positions)
        })
        useMixARStore.getState().updateOverlaies(features)
      },
    )
  }, [overlayList, flightAreaList, range])

  return null
})

ARSenceUpdateData.displayName = 'ARSenceUpdateData'

export default ARSenceUpdateData
