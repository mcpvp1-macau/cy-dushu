import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useCesium } from 'resium'
import { PathLine } from './UavAirline'

type PropsType = {
  data: { pointX: number; pointY: number; pointZ: number }[]
  taskBasic: Record<string, any>
}

const Waypoint: FC<{
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
        image: '/images/airline/inverted-triangle.svg',
        scale: 1.1,
        eyeOffset: new Cesium.Cartesian3(0, 0, -5),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: index + '',
        font: 'bold 16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -3),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10.0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
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

const Polygon: FC<{ data: number[][] }> = memo(({ data }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const positions = Cesium.Cartesian3.fromDegreesArrayHeights(data.flat())

    // 创建多边形几何实例
    const instance1 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        extrudedHeight: 0,
      }),
    })

    // 创建边界线几何实例
    const instance2 = new Cesium.GeometryInstance({
      geometry: new Cesium.GroundPolylineGeometry({
        positions: [...positions, positions[0]],
      }),
    })

    const primitive = new Cesium.GroundPrimitive({
      geometryInstances: [instance1], //可以是实例数组
      appearance: new Cesium.MaterialAppearance({
        translucent: true,
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString('#4c90f0').withAlpha(0.3),
        }),
      }),
      allowPicking: true,
    })
    const outlinePrimitive = new Cesium.GroundPolylinePrimitive({
      geometryInstances: [instance2],
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString('#4c90f0'),
        }),
      }),
    })
    viewer.scene.primitives.add(primitive)
    viewer.scene.primitives.add(outlinePrimitive)

    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(primitive)
        viewer.scene.primitives.remove(outlinePrimitive)
      })
    }
  }, [viewer, data])

  return null
})

const UavAreaWayline: FC<PropsType> = memo(({ data, taskBasic }) => {
  const refHeight =
    taskBasic.executeHeightMode === 'WGS84'
      ? 0
      : taskBasic?.takeOffRefPoint?.[2] ?? 0

  return (
    <>
      {/* 航点之间的连线 */}
      {data.map((point, i) => {
        const nextPoint = data[i + 1]
        if (!nextPoint) {
          return null
        }
        return (
          <PathLine
            key={i}
            point1={{ ...point, pointZ: refHeight + point.pointZ }}
            point2={{ ...nextPoint, pointZ: refHeight + nextPoint.pointZ }}
          />
        )
      })}
      {Array.isArray(taskBasic.polygon) && taskBasic.polygon.length > 1 && (
        <Polygon data={taskBasic.polygon} />
      )}
      {data.map((item, index) => (
        <Waypoint
          key={index}
          data={{ ...item, pointZ: refHeight + item.pointZ }}
          index={index + 1}
        />
      ))}
    </>
  )
})

UavAreaWayline.displayName = 'UavAreaWayline'

export default UavAreaWayline
