import { AirpointsConfigItem } from '@/store/wayline/uav-airline/types'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  data: AirpointsConfigItem[]
  deltaHeight: number
  isVirtual?: boolean
}

const Path: FC<PropsType> = memo(({ data, deltaHeight, isVirtual = false }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || data.length < 2) {
      return
    }

    const primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: data.map((v) =>
            Cesium.Cartesian3.fromDegrees(
              v.pointX,
              v.pointY,
              v.pointZ + deltaHeight,
            ),
          ),
          width: 4,
        }),
      }),
      // 虚线
      appearance: new Cesium.PolylineMaterialAppearance({
        material: isVirtual
          ? new Cesium.Material({
              fabric: {
                type: 'PolylineDash',
                uniforms: {
                  color: Cesium.Color.fromCssColorString('#03D68F'),
                  gapColor: Cesium.Color.TRANSPARENT,
                  dashLength: 20.0,
                  // dashPattern: 255.0,
                },
              },
            })
          : new Cesium.Material({
              fabric: {
                type: 'Color',
                uniforms: {
                  color: Cesium.Color.fromCssColorString('#03D68F'),
                },
              },
            }),
        renderState: {
          depthTest: {
            enabled: !isVirtual,
          },
        },
      }),
      asynchronous: false,
    })

    viewer.scene.primitives.add(primitive)
    return () => {
      if (viewer.scene && primitive) {
        viewer.scene.primitives.remove(primitive)
      }
    }
  }, [data, deltaHeight, isVirtual])

  return null
})

Path.displayName = 'Path'

export default Path
