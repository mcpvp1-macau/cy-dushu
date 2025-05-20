import data from './GuizhouFarm.json'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

/** 贵州兴义自定义区域 */
const GuizhouFarm: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const outlinePrimitive = new Cesium.GroundPolylinePrimitive({
      geometryInstances: data.features
        .map((feature) => {
          return feature.geometry.coordinates[0].map((coordinates) => {
            const coords = coordinates.map((coord) => {
              return Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
            })
            return new Cesium.GeometryInstance({
              geometry: new Cesium.GroundPolylineGeometry({
                positions: coords,
              }),
            })
          })
        })
        .flat(),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString('#FF0000'),
        }),
      }),
    })

    viewer.scene.primitives.add(outlinePrimitive)

    return () => {
      if (viewer.scene.primitives) {
        viewer.scene.primitives.remove(outlinePrimitive)
      }
    }
  }, [viewer])

  return null
})

GuizhouFarm.displayName = 'GuizhouFarm'

export default GuizhouFarm
