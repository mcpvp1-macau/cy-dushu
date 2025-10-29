import * as Cesium from 'cesium'
import { useCesium } from 'resium'

type PropsType = {
  position: Cesium.Cartesian3
  radius: number
}

const SafetySphere: FC<PropsType> = memo((props) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const sphere = new Cesium.SphereGeometry({
      radius: props.radius,
      stackPartitions: 9,
      slicePartitions: 18,
    })

    const sphereInstance = new Cesium.GeometryInstance({
      geometry: sphere,
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(props.position),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString('#e4742e').withAlpha(0.15),
        ),
      },
    })

    const spherePrimitive = new Cesium.Primitive({
      geometryInstances: [sphereInstance],
      appearance: new Cesium.PerInstanceColorAppearance({
        translucent: true,
        closed: true,
      }),
      releaseGeometryInstances: false,
      asynchronous: false,
    })

    const sphereOutline = new Cesium.SphereOutlineGeometry({
      radius: props.radius,
      stackPartitions: 9,
      slicePartitions: 18,
    })

    const sphereOutlineInstance = new Cesium.GeometryInstance({
      geometry: sphereOutline,
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(props.position),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString('#e4742e').withAlpha(0.4),
        ),
      },
    })

    const sphereOutlinePrimitive = new Cesium.Primitive({
      geometryInstances: [sphereOutlineInstance],
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true,
        translucent: true,
      }),
      releaseGeometryInstances: false,
      asynchronous: false,
    })

    viewer.scene.primitives.add(spherePrimitive)
    viewer.scene.primitives.add(sphereOutlinePrimitive)

    return () => {
      viewer.scene.primitives.remove(spherePrimitive)
      viewer.scene.primitives.remove(sphereOutlinePrimitive)
    }
  }, [props.position, props.radius, viewer])

  return null
})

SafetySphere.displayName = 'SafetySphere'

export default SafetySphere
