import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt, flatten } from 'lodash'

type PropsType = {
  data: API_GEO_SERACH.domain.AOI
}

const ARSceneAOI: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || !data) {
      return
    }

    const positions = Cesium.Cartesian3.fromDegreesArray(
      flatten(data.coordinates.map((e) => [e[0], e[1]])),
    )

    // 创建多边形几何实例
    const instance1 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        extrudedHeight: 0,
      }),
      id: `aoi-${data.id}`,

      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString('#5159a2').withAlpha(0.2),
        ),
      },
    })

    const primitive = new Cesium.Primitive({
      geometryInstances: [instance1], //可以是实例数组
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        flat: true,
        renderState: {
          depthTest: {
            enabled: true,
          },
        },
      }),
      allowPicking: true,
    })

    viewer.scene.primitives.add(primitive)

    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(primitive)
      })
    }
  }, [viewer, data])

  return null
})

ARSceneAOI.displayName = 'ARSceneAOI'

export default ARSceneAOI
