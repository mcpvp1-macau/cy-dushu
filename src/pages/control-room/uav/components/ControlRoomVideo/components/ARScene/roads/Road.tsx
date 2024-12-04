import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  data: API_GEO_SERACH.domain.Road
}

const ARSenceRoad: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer) {
      return
    }

    // 创建走廊几何体
    const corridorGeometry = new Cesium.CorridorGeometry({
      positions: Cesium.Cartesian3.fromDegreesArray(data.coordinates.flat()),
      width: 5, // 走廊的宽度（米）
      cornerType: Cesium.CornerType.ROUNDED, // 走廊的拐角类型
      ellipsoid: Cesium.Ellipsoid.WGS84,
      height: 0,
    })

    // 将几何体转换为几何体实例
    const geometryInstance = new Cesium.GeometryInstance({
      geometry: corridorGeometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString('#ffb3667f'),
        ),
        distanceDisplayCondition:
          new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(0, 1000),
      },
    })

    // 创建 Primitive 并添加到场景
    const corridorPrimitive = new Cesium.Primitive({
      geometryInstances: geometryInstance,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        translucent: true,
      }),
    })

    // 将 Primitive 添加到场景中
    viewer.scene.primitives.add(corridorPrimitive)

    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(corridorPrimitive)
      })
    }
  }, [data, viewer])

  return null
})

ARSenceRoad.displayName = 'ARSenceRoad'

export default ARSenceRoad
