import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  data: { pointX: number; pointY: number; pointZ: number }[]
}

const GroundWayline: FC<{
  data: PropsType['data'][0]
  index: number
}> = memo(({ data, index }) => {
  const { viewer } = useCesium()

  const entityRef = useRef<Cesium.Entity | null>(null)

  useEffect(() => {
    if (!viewer?.scene) return
    const { pointX, pointY, pointZ } = data

    // 航点
    const position = Cesium.Cartesian3.fromDegrees(pointX, pointY, pointZ)
    entityRef.current = viewer.entities.add({
      position,
      billboard: {
        image: '/images/airline/inverted-triangle-blue.svg',
        scale: 1.1,
        eyeOffset: new Cesium.Cartesian3(0, 0, -5),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: index + '',
        font: 'bold 16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -3),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10.0),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })

    return () => {
      attempt(() => {
        if (entityRef.current) {
          viewer?.entities?.remove(entityRef.current)
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
          Cesium.Color.fromCssColorString('#688de3'),
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
        <GroundWayline key={index} data={item} index={index + 1} />
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
