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
    const startTimeRef = useRef(Cesium.JulianDate.now())

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

    const durationSeconds = useMemo(() => durationMs / 1000, [durationMs])

    const radiusProperty = useMemo(() => {
      const startTime = startTimeRef.current
      return new Cesium.CallbackProperty((time) => {
        const currentTime = time ?? Cesium.JulianDate.now()
        const elapsedSeconds =
          (Cesium.JulianDate.secondsDifference(currentTime, startTime) % durationSeconds) +
          durationSeconds
        const progress = (elapsedSeconds % durationSeconds) / durationSeconds
        return maxRadius * (0.3 + progress * 0.7)
      }, false)
    }, [durationSeconds, maxRadius])

    const material = useMemo(() => {
      const baseColor = color ?? Cesium.Color.fromCssColorString('#32a8ff')
      const startTime = startTimeRef.current
      const scratchColor = new Cesium.Color()

      return new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty((time) => {
          const currentTime = time ?? Cesium.JulianDate.now()
          const elapsedSeconds =
            (Cesium.JulianDate.secondsDifference(currentTime, startTime) % durationSeconds) +
            durationSeconds
          const progress = (elapsedSeconds % durationSeconds) / durationSeconds
          const alpha = 0.6 * (1 - progress)
          Cesium.Color.clone(baseColor, scratchColor)
          scratchColor.alpha = alpha
          return scratchColor
        }, false),
      )
    }, [color, durationSeconds])

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
