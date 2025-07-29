import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  value: {
    lng: number
    lat: number
    alt?: number
  }[]
  /** @deprecated 这个参数已经没有用了 */
  useCallback?: boolean
  materialType?: 'color' | 'outline' | 'glow'
  color?: string
  clampToGround?: boolean
}

/** 历史轨迹 */
const HistoryTrack: FC<PropsType> = memo(
  ({
    value: historyTrack,
    materialType = 'color',
    color = '#ef4444',
    clampToGround = false,
  }) => {
    const { viewer } = useCesium()

    const appearance = useMemo(() => {
      if (materialType === 'color') {
        return new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(Cesium.Material.ColorType, {
            color: Cesium.Color.fromCssColorString(color),
          }),
        })
      } else if (materialType === 'outline') {
        return new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(
            Cesium.Material.PolylineOutlineType,
            {
              color: Cesium.Color.fromCssColorString(color),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
            },
          ),
        })
      } else {
        return new Cesium.PolylineMaterialAppearance({
          material: Cesium.Material.fromType(Cesium.Material.PolylineGlowType, {
            color: Cesium.Color.fromCssColorString(color),
          }),
        })
      }
    }, [color, materialType])

    useEffect(() => {
      if (!viewer || historyTrack.length < 2) {
        return
      }

      let primitive: Cesium.GroundPolylinePrimitive | Cesium.Primitive | null =
        null

      if (clampToGround) {
        // 贴地情况
        primitive = new Cesium.GroundPolylinePrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.GroundPolylineGeometry({
              positions: historyTrack.map((v) =>
                Cesium.Cartesian3.fromDegrees(v.lng, v.lat),
              ),
              width: 2,
            }),
          }),
          appearance,
          asynchronous: false,
        })
      } else {
        // 不贴地情况
        primitive = new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: historyTrack.map((v) =>
                Cesium.Cartesian3.fromDegrees(v.lng, v.lat, v.alt ?? 0),
              ),
              width:
                materialType === 'color'
                  ? 2
                  : materialType === 'outline'
                  ? 3
                  : 4,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromCssColorString(color),
              ),
            },
          }),
          appearance,
          asynchronous: false,
        })
      }

      viewer.scene.primitives.add(primitive)

      return () => {
        attempt(() => {
          if (primitive && viewer.scene.primitives) {
            viewer.scene.primitives.remove(primitive)
          }
        })
      }
    }, [viewer, historyTrack, appearance, clampToGround, materialType, color])

    return null
  },
)

export default HistoryTrack
