import { AirpointsConfigItem } from '@/store/wayline/uav-airline/types'
import { useLatest } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { bezierSpline } from '@turf/turf'

type PropsType = {
  data: AirpointsConfigItem[]
  deltaHeight: number
}

const Path: FC<PropsType> = memo(({ data, deltaHeight }) => {
  const { viewer } = useCesium()

  const dataLatest = useLatest(data)
  const deltaHeightLatest = useLatest(deltaHeight)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const positions = new Cesium.CallbackProperty((_, result) => {
      if (dataLatest.current.length < 2) {
        return Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0])
      }

      const positions = Cesium.Cartesian3.fromDegreesArrayHeights(
        dataLatest.current.flatMap((point) => [
          point.pointX,
          point.pointY,
          point.pointZ + deltaHeightLatest.current,
        ]),
      )
      if (Cesium.defined(result)) {
        result.length = 0 // 清空现有数组
        result.push(...positions)
      }
      return positions
    }, false)

    const e = viewer.entities.add({
      polyline: {
        positions,
        width: 4,
        material: Cesium.Color.fromCssColorString('#03D68F'),
      },
    })

    return () => {
      if (viewer.entities && e) {
        viewer.entities.remove(e)
      }
    }
  }, [viewer])

  return null
})

Path.displayName = 'Path'

export default Path
