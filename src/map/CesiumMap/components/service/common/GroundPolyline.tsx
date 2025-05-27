import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  positions: number[][]
  outlineColor?: string
  outlineWidth?: number
}

const GroundPolyline: FC<PropsType> = memo(
  ({ positions, outlineColor = '#3b82f6', outlineWidth = 2 }) => {
    const { viewer } = useCesium()

    useEffect(() => {
      if (!viewer) {
        return
      }

      // 创建边界线几何实例
      const instance2 = new Cesium.GeometryInstance({
        geometry: new Cesium.GroundPolylineGeometry({
          positions: [...positions, positions[0]].map((e) =>
            Cesium.Cartesian3.fromDegrees(e[0], e[1], 0),
          ),
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

      viewer.scene.primitives.add(outlinePrimitive)

      return () => {
        attempt(() => {
          viewer.scene.primitives.remove(outlinePrimitive)
        })
      }
    }, [viewer, positions, outlineColor, outlineWidth])

    return null
  },
)

GroundPolyline.displayName = 'GroundPolyline'

export default GroundPolyline
