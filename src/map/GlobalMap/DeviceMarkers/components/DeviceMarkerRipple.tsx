import { EllipseGraphics, Entity } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  position: Cesium.Cartesian3 | [number, number, number?]
  /** ms */
  durationMs?: number
  maxRadius?: number
  color?: Cesium.Color
}

const DeviceMarkerRipple: FC<PropsType> = memo(
  ({ position, durationMs = 2000, maxRadius = 80, color }) => {
    const startTimeRef = useRef(performance.now())

    const center = useMemo(() => {
      if (Array.isArray(position)) {
        const [lng, lat, alt] = position
        if (lng == null || lat == null) {
          return null
        }
        return Cesium.Cartesian3.fromDegrees(lng, lat, alt ?? 0)
      }
      return position
    }, [position])

    const radiusProperty = useMemo(
      () =>
        new Cesium.CallbackProperty(() => {
          const elapsed = (performance.now() - startTimeRef.current) % durationMs
          const progress = elapsed / durationMs
          return maxRadius * (0.3 + progress * 0.7)
        }, false),
      [durationMs, maxRadius],
    )

    const material = useMemo(
      () =>
        new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty(() => {
            const elapsed = (performance.now() - startTimeRef.current) % durationMs
            const progress = elapsed / durationMs
            const alpha = 0.6 * (1 - progress)
            const baseColor = color ?? Cesium.Color.fromCssColorString('#32a8ff')
            return baseColor.withAlpha(alpha)
          }, false),
        ),
      [color, durationMs],
    )

    if (!center) {
      return null
    }

    return (
      <Entity position={center}>
        <EllipseGraphics
          semiMajorAxis={radiusProperty}
          semiMinorAxis={radiusProperty}
          heightReference={Cesium.HeightReference.NONE}
          material={material}
        />
      </Entity>
    )
  },
)

DeviceMarkerRipple.displayName = 'DeviceMarkerRipple'

export default DeviceMarkerRipple
