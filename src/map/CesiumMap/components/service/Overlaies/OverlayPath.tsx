import { useCesium, PointPrimitive, Label } from 'resium'
import * as Cesium from 'cesium'
import { flatten } from 'lodash'

type PropsType = {
  data: any
  primitives: Cesium.PrimitiveCollection
  isGround?: boolean
  path: number[][]
  stroke: string
  strokeWeight?: number
  strokeStyle?: string
  asynchronous?: boolean
  label?: string
  showPoints?: boolean
}

/** 覆盖物 - 路径 */
const OverlayPath: FC<PropsType> = memo(
  ({
    data,
    primitives,
    isGround = true,
    path,
    stroke,
    strokeWeight = 2,
    strokeStyle = 'solid',
    asynchronous = false,
    label = '',
    showPoints = true,
  }) => {
    const { viewer } = useCesium()

    useEffect(() => {
      if (!viewer || !path || path.length < 2) {
        return
      }

      const positions = Cesium.Cartesian3.fromDegreesArrayHeights(
        flatten(path),
      )

      const appearance = new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString(stroke),
        }),
      })

      const geometry = new Cesium.GroundPolylineGeometry({
        positions,
        width: strokeWeight,
      })

      const instance = new Cesium.GeometryInstance({
        geometry,
        id: data,
      })

      let primitive: Cesium.GroundPolylinePrimitive | Cesium.Primitive

      if (isGround) {
        primitive = new Cesium.GroundPolylinePrimitive({
          geometryInstances: instance,
          appearance,
          asynchronous,
        })
      } else {
        primitive = new Cesium.Primitive({
          geometryInstances: instance,
          appearance,
          asynchronous,
        })
      }

      primitives.add(primitive)

      return () => {
        primitives.remove(primitive)
      }
    }, [viewer, path, stroke, strokeWeight, strokeStyle, data, primitives, isGround, asynchronous])

    // Calculate center point for label
    const centerPosition = useMemo(() => {
      if (!path || path.length < 2) return null
      const midIndex = Math.floor(path.length / 2)
      const midPoint = path[midIndex]
      return Cesium.Cartesian3.fromDegrees(midPoint[0], midPoint[1], midPoint[2] || 0)
    }, [path])

    console.info('OverlayPath render', showPoints, path)

    return (
      <>
        {/* Render points at each vertex */}
        {showPoints && path.map((point, index) => {
          const position = Cesium.Cartesian3.fromDegrees(point[0], point[1], point[2] || 0)
          return (
            <PointPrimitive
              key={`path-${data}-point-${index}`}
              position={position}
              color={Cesium.Color.fromCssColorString(stroke)}
              pixelSize={8}
              outlineColor={Cesium.Color.fromCssColorString('#fff')}
              outlineWidth={2}
              disableDepthTestDistance={16_000_000}
            />
          )
        })}

        {/* Render label at center */}
        {label && centerPosition && (
          <Label
            position={centerPosition}
            scale={0.2}
            verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
            horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
            text={label}
            outlineColor={Cesium.Color.fromCssColorString('#000')}
            outlineWidth={5}
            font="700 64px Helvetica"
            pixelOffset={new Cesium.Cartesian2(0, 20)}
            backgroundColor={Cesium.Color.BLACK}
            fillColor={Cesium.Color.WHITE}
            backgroundPadding={new Cesium.Cartesian2(5, 5)}
            disableDepthTestDistance={Infinity}
            style={Cesium.LabelStyle.FILL_AND_OUTLINE}
            distanceDisplayCondition={
              new Cesium.DistanceDisplayCondition(0, 200_000)
            }
          />
        )}
      </>
    )
  },
)

OverlayPath.displayName = 'OverlayPath'

export default OverlayPath
