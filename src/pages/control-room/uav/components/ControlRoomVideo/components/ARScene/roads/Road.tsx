import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  data: API_GEO_SERACH.domain.Road
  width?: number
  color?: string
  collection: Cesium.PrimitiveCollection
}

const ARSenceRoad: FC<PropsType> = memo(
  ({ data, width = 5, color = '#ffb366', collection }) => {
    useEffect(() => {
      // 创建走廊几何体
      const corridorGeometry = new Cesium.CorridorGeometry({
        positions: Cesium.Cartesian3.fromDegreesArray(data.coordinates.flat()),
        width, // 走廊的宽度（米）
        cornerType: Cesium.CornerType.ROUNDED, // 走廊的拐角类型
        ellipsoid: Cesium.Ellipsoid.WGS84,
        height: 0,
        extrudedHeight: 1,
      })

      // 将几何体转换为几何体实例
      const geometryInstance = new Cesium.GeometryInstance({
        geometry: corridorGeometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString(color),
          ),
          distanceDisplayCondition:
            new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(
              0,
              1000,
            ),
        },
      })

      // 创建 Primitive 并添加到场景
      const corridorPrimitive = new Cesium.Primitive({
        geometryInstances: geometryInstance,
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: false,
          renderState: {
            depthTest: {
              enabled: false,
            },
            depthMask: true,
          },
        }),
      })

      // 将 Primitive 添加到场景中
      collection.add(corridorPrimitive)

      return () => {
        attempt(() => {
          collection.remove(corridorPrimitive)
        })
      }
    }, [data, collection])

    return null
  },
)

ARSenceRoad.displayName = 'ARSenceRoad'

export default ARSenceRoad
