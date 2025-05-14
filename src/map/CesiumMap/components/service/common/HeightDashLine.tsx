import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useCesium } from 'resium'

type PropsType = {
  position: number[]
  color?: string
}

const HeightDashLine: FC<PropsType> = memo(
  ({ position, color = '#c7d1dc' }) => {
    const { viewer } = useCesium()

    useEffect(() => {
      if (!viewer) {
        return
      }

      const primitives = viewer.scene.primitives

      const p = position
      const cartographic = Cesium.Cartographic.fromDegrees(p[0], p[1])

      // 航点与地形点之间的虚线
      const instances = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArrayHeights([
            p[0],
            p[1],
            viewer.scene.globe.getHeight(cartographic) ?? 0,
            p[0],
            p[1],
            p[2],
          ]),
          width: 1,
        }),
      })

      const linePrimitive = new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType('PolylineDash', {
            color: Cesium.Color.fromCssColorString(color),
            dashLength: 4,
          }),
        }),
        asynchronous: false,
      })

      primitives.add(linePrimitive)

      const pointPrimitiveCollection = new Cesium.PointPrimitiveCollection()

      pointPrimitiveCollection.add({
        position: Cesium.Cartesian3.fromDegrees(
          p[0],
          p[1],
          viewer.scene.globe.getHeight(cartographic),
        ),
        pixelSize: 5,
        color: Cesium.Color.fromCssColorString(color),
        outlineWidth: 1,
        outlineColor: Cesium.Color.BLACK,
        show: true,
      })

      primitives.add(pointPrimitiveCollection)

      return () => {
        attempt(() => {
          primitives.remove(linePrimitive)
          primitives.remove(pointPrimitiveCollection)
        })
      }
    }, [viewer, color, position])

    return null
  },
)

HeightDashLine.displayName = 'HeightDashLine'

export default HeightDashLine
