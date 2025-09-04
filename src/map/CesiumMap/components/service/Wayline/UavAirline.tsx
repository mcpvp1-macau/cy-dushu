import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt, round } from 'lodash'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { emtpyObject } from '@/constant/data'
import { getWaylinePointBillboardSvgURI } from '@/components/Icon/WaylinePoint'

type PropsType = {
  data: { pointX: number; pointY: number; pointZ: number }[]
  executeDeviceId?: string
  taskBasic?: Record<string, any>
}

const Waypoint: FC<{
  data: PropsType['data'][0]
  index: number
}> = memo(({ data, index }) => {
  const { viewer } = useCesium()

  const entityRef = useRef<Cesium.Entity | null>(null)
  const lineRef = useRef<Cesium.Entity | null>(null)
  const bottomRef = useRef<Cesium.Entity | null>(null)

  useEffect(() => {
    if (!viewer?.scene) return
    const { pointX, pointY, pointZ } = data

    // 航点与地形点之间的虚线
    lineRef.current = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          pointX,
          pointY,
          0,
          pointX,
          pointY,
          pointZ,
        ]),
        width: 1,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#fff'),
          dashLength: 8,
        }),
      },
    })

    // 地形点
    const bottomPosition = Cesium.Cartesian3.fromDegrees(pointX, pointY, 0)
    bottomRef.current = viewer.entities.add({
      position: bottomPosition,
      billboard: {
        image: '/images/airline/ground-point.svg',
        scale: 0.8,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })

    const uri = getWaylinePointBillboardSvgURI({
      text: index,
      color: '#03D68F',
    })

    // 航点
    const position = Cesium.Cartesian3.fromDegrees(pointX, pointY, pointZ)
    entityRef.current = viewer.entities.add({
      position,
      billboard: {
        image: uri,
        scale: 1.1,
        eyeOffset: new Cesium.Cartesian3(0, 0, -5),
      },
    })

    return () => {
      attempt(() => {
        if (entityRef.current) {
          viewer?.entities?.remove(entityRef.current)
        }
        if (bottomRef.current) {
          viewer?.entities?.remove(bottomRef.current)
        }
        if (lineRef.current) {
          viewer?.entities?.remove(lineRef.current)
        }
      })
    }
  }, [data])

  return null
})

export const PathLine: FC<{
  point1: PropsType['data'][0]
  point2: PropsType['data'][0]
}> = memo(({ point1, point2 }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer?.scene) return

    const { pointX: lng1, pointY: lat1, pointZ: alt1 } = point1
    const { pointX: lng2, pointY: lat2, pointZ: alt2 } = point2

    const positions = [
      Cesium.Cartesian3.fromDegrees(lng1, lat1, alt1),
      Cesium.Cartesian3.fromDegrees(lng2, lat2, alt2),
    ]

    const entity = viewer.entities.add({
      polyline: {
        positions,
        width: 12,
        material: new Cesium.PolylineArrowMaterialProperty(
          Cesium.Color.fromCssColorString('#03D68F'),
        ),
      },
    })

    return () => {
      attempt(() => {
        viewer?.entities?.remove(entity)
      })
    }
  }, [point1, point2])

  return null
})

const UavWayline: FC<PropsType> = memo(
  ({ data, executeDeviceId, taskBasic }) => {
    const p = useGlobalWsStore(
      (s) =>
        s.deviceRealtimeProperties[executeDeviceId ?? 'never']?.properties ??
        emtpyObject,
    )

    // 起飞点高度
    const hHeight = useMemo(() => {
      if (p.altitude && p.height) {
        return round(p.altitude - p.height - 1, 1)
      }
      return taskBasic?.takeOffRefPoint?.[2] ?? 0
    }, [p, taskBasic])

    const newData = useMemo(() => {
      if (!data) return []
      const newData = data.map((item) => {
        const { pointX, pointY, pointZ } = item
        return {
          pointX,
          pointY,
          pointZ: pointZ + hHeight,
        }
      })
      return newData
    }, [data, hHeight])

    return (
      <>
        {/* 航点之间的连线 */}
        {newData.map((point, i) => {
          const nextPoint = newData[i + 1]
          if (!nextPoint) {
            return null
          }
          return <PathLine key={i} point1={point} point2={nextPoint} />
        })}
        {newData.map((item, index) => (
          <Waypoint key={index} data={item} index={index + 1} />
        ))}
      </>
    )
  },
)

export default UavWayline
