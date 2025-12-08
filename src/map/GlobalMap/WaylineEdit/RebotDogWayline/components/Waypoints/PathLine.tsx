import { RebotDogWaypointConfigType } from '@/store/wayline/rebot-dog-wayline/types'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
type PropsType = {
  point1: RebotDogWaypointConfigType
  point2: RebotDogWaypointConfigType
}

const PathLine: FC<PropsType> = memo(({ point1, point2 }) => {
  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer?.scene) return

    const { pointX: lng1, pointY: lat1, pointZ: alt1 } = point1
    const { pointX: lng2, pointY: lat2, pointZ: alt2 } = point2

    const positions = new Cesium.CallbackProperty((_, result) => {
      const positions = [
        Cesium.Cartesian3.fromDegrees(lng1, lat1, alt1),
        Cesium.Cartesian3.fromDegrees(lng2, lat2, alt2),
      ]
      if (Cesium.defined(result)) {
        result.length = 0 // 清空现有数组
        result.push(...positions)
      }
      return positions
    }, false)

    const entity = viewer.entities.add({
      polyline: {
        positions,
        width: 12,
        material: new Cesium.PolylineArrowMaterialProperty(
          Cesium.Color.fromCssColorString('#5d8ee9'),
        ),
        clampToGround: true,
        // classificationType: Cesium.ClassificationType.TERRAIN,
      },
    })

    return () => {
      try {
        viewer?.entities?.remove(entity)
      } catch (_error) {}
    }
  }, [point1, point2])

  return null
})

PathLine.displayName = 'PathLine'

export default PathLine
