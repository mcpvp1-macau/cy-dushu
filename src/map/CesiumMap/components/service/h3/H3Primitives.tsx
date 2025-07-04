import { cellToBoundary } from 'h3-js'
import { useCesium } from 'resium'

type PropsType = {
  data: { h3Code: string; color: string }[]
}

const H3Primitives: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || !data.length) {
      return
    }

    const pris = data.map((e) => {
      const hexBoundary = cellToBoundary(e.h3Code)
      const p = hexBoundary.map((item) => [item[1], item[0]]).flat()
      p.push(p[0], p[1])
      const positions = Cesium.Cartesian3.fromDegreesArray(p)

      // 创建多边形几何实例
      const instance1 = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(positions),
          extrudedHeight: 1,
        }),

        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString(e.color).withAlpha(0.25),
          ),
        },
      })

      // 创建边界线几何实例
      const instance2 = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonOutlineGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        }),

        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString(e.color),
          ),
        },
      })

      return { instance1, instance2 }
    })

    const primitive = new Cesium.Primitive({
      geometryInstances: pris.map((e) => e.instance1), //可以是实例数组
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        flat: true,
        renderState: {
          depthTest: {
            enabled: false,
          },
        },
      }),
      async: false,
    })
    const outlinePrimitive = new Cesium.Primitive({
      geometryInstances: pris.map((e) => e.instance2),
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        renderState: {
          lineWidth: Math.min(2.0, viewer.scene.maximumAliasedLineWidth),
          depthTest: {
            enabled: false,
          },
        },
      }),
      async: false,
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
  }, [viewer, data])

  return null
})

H3Primitives.displayName = 'H3Primitives'

export default H3Primitives
