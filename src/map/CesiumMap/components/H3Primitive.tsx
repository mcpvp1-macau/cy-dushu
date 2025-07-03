import { cellToBoundary } from 'h3-js'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  h3Code: string
  color: string
}

const H3Primitive: FC<PropsType> = memo((data) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || !data.h3Code || !data.color) {
      return
    }

    const hexBoundary = cellToBoundary(data.h3Code)
    const p = hexBoundary.map((item) => [item[1], item[0]]).flat()
    p.push(p[0], p[1])

    const positions = Cesium.Cartesian3.fromDegreesArray(p)

    // 创建多边形几何实例
    const instance1 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        extrudedHeight: 1,
      }),
    })

    // 创建边界线几何实例
    const instance2 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions,
        width: 1,
      }),
    })

    const primitive = new Cesium.Primitive({
      geometryInstances: instance1, //可以是实例数组
      appearance: new Cesium.MaterialAppearance({
        translucent: true,
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(data.color).withAlpha(0.2),
        }),
      }),
      asynchronous: false,
    })
    const outlinePrimitive = new Cesium.Primitive({
      geometryInstances: instance2,
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(data.color),
        }),
      }),
      asynchronous: false,
    })
    viewer.scene.primitives.add(primitive)
    viewer.scene.primitives.add(outlinePrimitive)

    return () => {
      if (viewer.scene?.primitives) {
        // 清除所有的H3图形
        viewer.scene.primitives.remove(primitive)
        viewer.scene.primitives.remove(outlinePrimitive)
      }
    }
  }, [viewer, data.h3Code, data.color])

  return null
})

H3Primitive.displayName = 'H3Primitive'

export default H3Primitive
