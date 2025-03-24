import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  data: { pointX: number; pointY: number; pointZ: number }[]
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

    // 航点
    const position = Cesium.Cartesian3.fromDegrees(pointX, pointY, pointZ)
    entityRef.current = viewer.entities.add({
      position,
      billboard: {
        image: '/images/airline/inverted-triangle.svg',
        scale: 1.1,
        eyeOffset: new Cesium.Cartesian3(0, 0, -5),
      },
      label: {
        text: index + '',
        font: 'bold 16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -3),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10.0),
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
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#fff'),
          dashLength: 8,
        }),
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

const PathLine: FC<{
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

const UavWayline: FC<PropsType> = memo(({ data }) => {
  return (
    <>
      {data.map((item, index) => (
        <Waypoint key={index} data={item} index={index + 1} />
      ))}
      {/* 航点之间的连线 */}
      {data.map((point, i) => {
        const nextPoint = data[i + 1]
        if (!nextPoint) {
          return null
        }
        return <PathLine key={i} point1={point} point2={nextPoint} />
      })}
    </>
  )
})

export default UavWayline
