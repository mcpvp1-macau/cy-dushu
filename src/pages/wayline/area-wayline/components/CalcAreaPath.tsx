import WaylineAreaPathWorker from '@/worker/area_wayline_solution?worker'
import { useDebounceFn } from 'ahooks'
import { toMercator, toWgs84 } from '@turf/turf'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { AirlinePoint } from '@/store/wayline/uav-airline/types'
import { v4 } from 'uuid'
import { Polygon } from '@/wasm/area_wayline/area_wayline'
import * as turf from '@turf/turf'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { shouldJson } from '@/utils/json'
import { useAppMsg } from '@/hooks/useAppMsg'
import { wrap } from 'comlink'
import { WorkerAPI } from '@/worker/area_wayline_solution'

type PropsType = unknown

/** 计算面状航线 */
const CalcAreaPath: FC<PropsType> = memo(() => {
  const msgApi = useAppMsg()
  // 起飞点
  const takeOffRefPoint = useAreaWaylineStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  // 多边形
  const polygon = useAreaWaylineStore((s) => s.templateConfig.polygon)
  const mainK = useAreaWaylineStore((s) => s.templateConfig.mainK)

  const worker = useRef<ReturnType<typeof wrap<WorkerAPI>> | null>(null)
  if (!worker.current) {
    worker.current = wrap<WorkerAPI>(new WaylineAreaPathWorker())
  }

  const updateAirpointsConfig = useAreaWaylineStore(
    (s) => s.updateAirpointsConfig,
  )

  const updateFirstAirpoint = useAreaWaylineStore((s) => s.updateFirstAirpoint)

  const height = useAreaWaylineStore((s) => s.airlineConfig.height)
  const interval = useAreaWaylineStore((s) => s.templateConfig.interval)
  const enableAvoidNoFlyArea = useAreaWaylineStore(
    (s) => s.airlineConfig.enableAvoidNoFlyArea,
  )

  const { run: calcAreaWayline } = useDebounceFn(
    async () => {
      if (
        !polygon ||
        !worker.current ||
        !takeOffRefPoint ||
        polygon.length < 3
      ) {
        updateAirpointsConfig([])
        return
      }

      let outer: GeoJSON.Feature<
        GeoJSON.Polygon | GeoJSON.MultiPolygon
      > | null = turf.polygon([[...polygon, polygon[0]]])

      // 打开了避开禁飞区
      if (enableAvoidNoFlyArea) {
        const noFlyAreas = useFlightAreaStore
          .getState()
          .flightAreaList.filter(
            (e) =>
              e.overlayExtType === 'NO_FLY_ZONE' &&
              ['POLYGON', 'CIRCULAR'].includes(e.overlayType),
          )
          .map((e) => {
            const positions = shouldJson(e.overlayPositions)
            if (e.overlayType === 'POLYGON') {
              const polygon = turf.buffer(
                turf.polygon([
                  [...positions, positions[0]].map((p) => [p[0], p[1]]),
                ]),
                10,
                { units: 'meters' },
              )
              return polygon
            }
            const circle = turf.buffer(
              turf.circle([positions[0][0], positions[0][1]], positions[0][3], {
                units: 'meters',
                steps: 16,
              }),
              positions[0][3] / 10 + 10,
              { units: 'meters' },
            )
            return circle
          })
          .filter((e) => !!e)

        outer = turf.difference(turf.featureCollection([outer, ...noFlyAreas]))
      }

      if (outer === null) {
        msgApi.error('扫描区域异常，请检查是否完全在禁飞区内')
        return
      }

      // 将 mainK 斜率转换成角度
      const angle = Math.atan(mainK) * (180 / Math.PI)
      const turnAngle = -(90 - angle)
      const center = turf.center(outer)
      outer = turf.transformRotate(outer, turnAngle, { pivot: center })

      if (outer === null) {
        msgApi.error('扫描区域异常，请检查是否完全在禁飞区内')
        return
      }

      const pg = toMercator(outer)

      let outerPolygon: Polygon | null = null
      let innerPolygons: Polygon[] | null = null

      if (pg.geometry.type === 'Polygon') {
        outerPolygon = pg.geometry.coordinates[0].slice(0, -1).map((e) => ({
          x: e[0],
          y: e[1],
        }))
        innerPolygons =
          pg.geometry.coordinates.slice(1).map((coords) =>
            coords.slice(0, -1).map((e) => ({
              x: e[0],
              y: e[1],
            })),
          ) ?? []
      } else if (pg.geometry.type === 'MultiPolygon') {
        outerPolygon = pg.geometry.coordinates[0][0].slice(0, -1).map((e) => ({
          x: e[0],
          y: e[1],
        }))
        innerPolygons =
          pg.geometry.coordinates[0].slice(1).map((coords) =>
            coords.slice(0, -1).map((e) => ({
              x: e[0],
              y: e[1],
            })),
          ) ?? []
      }

      innerPolygons ??= []

      if (!outerPolygon) {
        msgApi.error('扫描区域异常')
        return
      }

      const takeoffPoint = turf.transformRotate(
        turf.point([takeOffRefPoint[0], takeOffRefPoint[1]]),
        -turnAngle,
        {
          pivot: center,
        },
      )

      const takeOffPointRes = toMercator(takeoffPoint)
      const res = await worker.current.solve(
        outerPolygon,
        innerPolygons,
        interval,
        {
          x: takeOffPointRes.geometry.coordinates[0],
          y: takeOffPointRes.geometry.coordinates[1],
        },
      )

      const wgs84Res = turf.transformRotate(
        toWgs84(turf.lineString(res.map((e) => [e.x, e.y]))),
        turnAngle,
        {
          pivot: center,
        },
      )

      // 优化最后的航点，减少航点数量：避免过近的航点等
      const filter_points: number[][] = []
      wgs84Res.geometry.coordinates.forEach((point) => {
        if (
          filter_points.length > 0 &&
          turf.distance(point, filter_points[filter_points.length - 1], {
            units: 'meters',
          }) < 3
        ) {
          filter_points.pop()
        }
        if (filter_points.length >= 2) {
          const last = filter_points[filter_points.length - 1]
          const secondLast = filter_points[filter_points.length - 2]
          const angle = turf.bearing(secondLast, last)
          const angle2 = turf.bearing(last, point)
          if (Math.abs(angle - angle2) < 1e-2) {
            filter_points.pop()
          }
        }
        filter_points.push(point)
      })

      const points = filter_points.map<AirlinePoint>((point, index) => ({
        positionIndex: index,
        positionName: `航点${index + 1}`,
        actions: [],
        pointX: point[0],
        pointY: point[1],
        pointZ: height,
      }))

      points[0].actions.push({
        config: { y: -90 },
        type: 'CAMERA_POSITION',
        xid: v4(),
      })

      for (const p of points) {
        p.actions.push({
          type: 'GET_PICTURE',
          xid: v4(),
          config: {
            useGlobalPayloadLensIndex: 0,
            payloadLensIndex: ['wide'],
          },
        })
      }

      updateAirpointsConfig(points)
      updateFirstAirpoint(points[0])
    },
    { wait: 500 },
  )

  useEffect(() => {
    calcAreaWayline()
  }, [polygon, mainK, takeOffRefPoint, interval, enableAvoidNoFlyArea])

  return null
})

CalcAreaPath.displayName = 'CalcAreaPath'

export default CalcAreaPath
