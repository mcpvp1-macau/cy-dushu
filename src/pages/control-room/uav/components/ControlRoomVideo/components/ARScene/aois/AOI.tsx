import { memo, type FC } from 'react'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  data: API_GEO_SERACH.domain.AOI
  collection: Cesium.PrimitiveCollection
}

const ARSceneAOI: FC<PropsType> = memo(({ data, collection }) => {
  useEffect(() => {
    if (!data) {
      return
    }
    const coordinates = data.coordinates.map((e) => [e[0], e[1]])

    if (coordinates.length === 0) {
      return
    }

    console.log('coordinates', coordinates)

    if (
      coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ) {
      coordinates.push(coordinates[0])
    }

    const positions = Cesium.Cartesian3.fromDegreesArray(coordinates.flat())

    // 创建多边形几何实例
    const instance1 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        extrudedHeight: 0,
      }),
      id: `aoi-${data.id}`,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString('#5159a2').withAlpha(0.5),
        ),
        distanceDisplayCondition:
          new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(0, 1000),
      },
    })

    const primitive = new Cesium.Primitive({
      geometryInstances: [instance1], //可以是实例数组
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: false,
        flat: false,
        translucent: true,

        renderState: {
          depthTest: {
            enabled: false,
          },
          depthMask: true,
          // 混合模式
          // blending: Cesium.BlendingState.ALPHA_BLEND,
        },
      }),

      allowPicking: true,
    })

    const polylinePrimitive = new Cesium.Primitive({
      geometryInstances: [
        new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineGeometry({
            positions,
            width: 2,
          }),

          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromCssColorString('#000000'),
            ),
            distanceDisplayCondition:
              new Cesium.DistanceDisplayConditionGeometryInstanceAttribute(
                0,
                1000,
              ),
          },
        }),
      ],

      appearance: new Cesium.PolylineColorAppearance({
        translucent: false,
      }),
    })

    collection.add(primitive)
    collection.add(polylinePrimitive)

    return () => {
      attempt(() => {
        collection.remove(primitive)
        collection.remove(polylinePrimitive)
      })
    }
  }, [data])

  return null
})

ARSceneAOI.displayName = 'ARSceneAOI'

export default ARSceneAOI
