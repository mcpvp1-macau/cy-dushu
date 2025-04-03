import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  positions: number[][]
  fillColor?: string
  outlineColor?: string
  outlineWidth?: number
}

const GroundPolygon: FC<PropsType> = memo(
  ({
    positions,
    fillColor = '#3b82f633',
    outlineColor = '#3b82f6',
    outlineWidth = 2,
  }) => {
    const { viewer } = useCesium()

    useEffect(() => {
      if (!viewer) {
        return
      }

      // 创建多边形几何实例
      const instance1 = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            positions.map((e) => Cesium.Cartesian3.fromDegrees(e[0], e[1], 0)),
          ),
          extrudedHeight: 0,
        }),
      })

      // 创建边界线几何实例
      const instance2 = new Cesium.GeometryInstance({
        geometry: new Cesium.GroundPolylineGeometry({
          positions: [...positions, positions[0]].map((e) =>
            Cesium.Cartesian3.fromDegrees(e[0], e[1], 0),
          ),
        }),
      })

      const primitive = new Cesium.GroundPrimitive({
        geometryInstances: [instance1], //可以是实例数组
        appearance: new Cesium.MaterialAppearance({
          translucent: true,
          material: Cesium.Material.fromType(Cesium.Material.ColorType, {
            color: Cesium.Color.fromCssColorString(fillColor),
          }),
        }),
      })
      const outlinePrimitive = new Cesium.GroundPolylinePrimitive({
        geometryInstances: [instance2],
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(Cesium.Material.ColorType, {
            color: Cesium.Color.fromCssColorString(outlineColor),
          }),
        }),
      })
      viewer.scene.primitives.add(primitive)
      viewer.scene.primitives.add(outlinePrimitive)

      return () => {
        viewer.scene.primitives.remove(primitive)
        viewer.scene.primitives.remove(outlinePrimitive)
      }
    }, [viewer, positions, fillColor, outlineColor, outlineWidth])

    return null
  },
)

GroundPolygon.displayName = 'GroundPolygon'

export default GroundPolygon
