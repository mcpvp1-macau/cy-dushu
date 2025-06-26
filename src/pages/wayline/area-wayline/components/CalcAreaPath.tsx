import WaylineAreaPathWorker from '@/worker/area_wayline_solution?worker'
import { wrap } from 'comlink'
import { WorkerAPI } from '@/worker/area_wayline_solution'
import { useDebounceFn } from 'ahooks'
import { toMercator, toWgs84 } from '@turf/turf'
import useAreaWaylineStore from '@/store/wayline/uav-area-wayline/useAreaWayline.store'
import { AirlinePoint } from '@/store/wayline/uav-airline/types'
import { v4 } from 'uuid'

type PropsType = unknown

/** 计算面状航线 */
const CalcAreaPath: FC<PropsType> = memo(() => {
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
      const pg = toMercator({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygon],
        },
      }).geometry.coordinates
      const takeOffPointRes = toMercator(takeOffRefPoint)
      const res = await worker.current!.solve(
        pg[0] as any,
        mainK,
        interval,
        takeOffPointRes as any,
      )
      const wgs84Res = toWgs84({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [res],
        },
      })
      const points = wgs84Res.geometry.coordinates[0].map<AirlinePoint>(
        (point, index) => ({
          positionIndex: index,
          positionName: `航点${index + 1}`,
          actions: [],
          pointX: point[0],
          pointY: point[1],
          pointZ: height,
        }),
      )

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
  }, [polygon, mainK, takeOffRefPoint, interval])

  return null
})

CalcAreaPath.displayName = 'CalcAreaPath'

export default CalcAreaPath
