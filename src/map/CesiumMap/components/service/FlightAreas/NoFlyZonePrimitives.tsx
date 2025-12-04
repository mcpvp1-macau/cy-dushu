import { CotType } from '@/store/map/useDraw.store'
import { shouldJson } from '@/utils/json'
import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import { CIRCLE_POINT_NUMBER } from '@/utils/customPrimitive/OverlayPrimitive'
import { attempt } from 'lodash'

type Props = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
  primitives: Cesium.PrimitiveCollection | undefined
  isGround: boolean
}

/**大疆禁飞区批渲染 */
const NoFlyZonePrimitives: FC<Props> = (props) => {
  const { overlays, primitives, isGround } = props

  // 通过id数组字符串来判断是否需要重新渲染
  const idList = overlays
    .map((o) => o.overlayId)
    .sort()
    .join(',')

  const polygonOverlays = overlays.map((overlay) => {
    if (overlay.cotType === CotType.SHAPE_CIRCLE) {
      const position = shouldJson(overlay.overlayPositions)?.[0]
      const center = [position?.[0], position?.[1], position?.[2]]
      const radius = position?.[3]

      const circle = turf.circle(center, radius, {
        steps: CIRCLE_POINT_NUMBER,
        units: 'meters',
      })

      return {
        ...overlay,
        overlayPositions: JSON.stringify(circle.geometry.coordinates[0]),
      }
    }

    return overlay
  })

  const createZonePrimitive = useMemoizedFn(() => {
    const collection = new Cesium.PrimitiveCollection()
    if (!overlays.length) return collection

    // 默认样式：红色填充
    const fillInstances: Cesium.GeometryInstance[] = []
    const outlineInstances: Cesium.GeometryInstance[] = []

    const LineGeometryClass = isGround
      ? Cesium.GroundPolylineGeometry
      : Cesium.PolylineGeometry

    polygonOverlays.forEach((overlay) => {
      const positions = shouldJson(overlay.overlayPositions).map((item) =>
        Cesium.Cartesian3.fromDegrees(item[0], item[1], item[2]),
      )

      fillInstances.push(
        new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(positions),
          }),
        }),
      )

      outlineInstances.push(
        new Cesium.GeometryInstance({
          geometry: new LineGeometryClass({
            positions,
            width: 2,
          }),
        }),
      )
    })

    const PrimitiveClass = isGround ? Cesium.GroundPrimitive : Cesium.Primitive
    const LinePrimitiveClass = isGround
      ? Cesium.GroundPolylinePrimitive
      : Cesium.Primitive

    const fillPrimitive = new PrimitiveClass({
      geometryInstances: fillInstances,
      appearance: new Cesium.MaterialAppearance({
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString('rgba(222, 66, 40, 0.3)'),
        }),
        flat: true,
      }),
    })

    const outlinePrimitive = new LinePrimitiveClass({
      geometryInstances: outlineInstances,
      appearance: new Cesium.MaterialAppearance({
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString('rgba(222, 66, 40, 1.0)'),
        }),
      }),
    })
    collection.add(fillPrimitive)
    collection.add(outlinePrimitive)

    return collection
  })

  const noFlyZonePrimitiveRef = useRef<Cesium.PrimitiveCollection | null>(null)
  useEffect(() => {
    if (!primitives) return

    noFlyZonePrimitiveRef.current = createZonePrimitive()
    primitives.add(noFlyZonePrimitiveRef.current)
    primitives.lowerToBottom(noFlyZonePrimitiveRef.current)

    return () => {
      attempt(() => {
        primitives.remove(noFlyZonePrimitiveRef.current)
      })
    }
  }, [idList, primitives])

  return <></>
}

NoFlyZonePrimitives.displayName = 'NoFlyZonePrimitives'

export default memo(NoFlyZonePrimitives)
