import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = {
  data: number[][]
}

const ARSceneTrack: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || data.length < 2) {
      return
    }

    const e = viewer.entities.add({
      polyline: {
        positions: data.map((item) =>
          Cesium.Cartesian3.fromDegrees(item[0], item[1], item[2]),
        ),
        width: 10,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Cesium.Color.fromCssColorString('#0ea5e9'),
        }),
      },
    })

    return () => {
      attempt(() => {
        viewer.scene.primitives.remove(e)
      })
    }
  }, [viewer, data])

  return null
})

ARSceneTrack.displayName = 'ARSceneTrack'

export default ARSceneTrack
