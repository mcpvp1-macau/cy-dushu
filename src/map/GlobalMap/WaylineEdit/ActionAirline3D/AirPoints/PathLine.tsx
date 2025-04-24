import { useEffect, type FC } from 'react'
import { memo } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { AirpointsConfigItem } from '@/store/wayline/uav-airline/types'
// import { getColorWithAlpha } from '@/utils/utils';

type PropsType = {
  point1: AirpointsConfigItem
  point2: AirpointsConfigItem
}

const PathLine: FC<PropsType> = ({ point1, point2 }) => {
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
          Cesium.Color.fromCssColorString('#03D68F'),
        ),
      },
    })

    return () => {
      try {
        viewer?.entities?.remove(entity)
      } catch (error) {}
    }
  }, [point1, point2])
  return <></>
}

export default memo(PathLine)
