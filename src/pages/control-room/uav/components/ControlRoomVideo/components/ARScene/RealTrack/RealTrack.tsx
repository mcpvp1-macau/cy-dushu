import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useLatest } from 'ahooks'

type PropsType = {
  data: number[][]
}

const ARSceneRealTrack: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()
  const latestData = useLatest(data)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const e = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          if (latestData.current.length < 2) {
            return []
          }
          return latestData.current.map((item) =>
            Cesium.Cartesian3.fromDegrees(item[0], item[1], item[2]),
          )
        }, false),
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

ARSceneRealTrack.displayName = 'ARSceneRealTrack'

export default ARSceneRealTrack
