import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  positions: number[][]
  color: string
}

const DrawingPolygon: FC<PropsType> = memo(({ positions, color }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    if (positions.length < 2) {
      return
    }

    const positionsCartesian3 = positions.map((item) =>
      Cesium.Cartesian3.fromDegrees(item[0], item[1]),
    )

    // 创建多边形几何实例
    const instance1 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positionsCartesian3),
        extrudedHeight: 0,
      }),
    })

    // 创建边界线几何实例
    const instance2 = new Cesium.GeometryInstance({
      geometry: new Cesium.GroundPolylineGeometry({
        positions: positionsCartesian3,
      }),
    })

    const primitive = new Cesium.GroundPrimitive({
      geometryInstances: instance1,
      appearance: new Cesium.MaterialAppearance({
        translucent: true,
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(color).withAlpha(0.5),
        }),
      }),
      asynchronous: false,
    })

    const outlinePrimitive = new Cesium.GroundPolylinePrimitive({
      geometryInstances: instance2,
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(color),
        }),
      }),
      asynchronous: false,
    })

    viewer.scene.primitives.add(primitive)
    viewer.scene.primitives.add(outlinePrimitive)

    return () => {
      if (viewer.scene.primitives) {
        viewer.scene.primitives.remove(primitive)
        viewer.scene.primitives.remove(outlinePrimitive)
      }
    }
  }, [viewer, color, positions])

  return null
})

DrawingPolygon.displayName = 'Polygon'

export default DrawingPolygon
