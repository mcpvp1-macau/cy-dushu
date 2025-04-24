import { memo, useEffect, type FC } from 'react'
import * as Cesium from 'cesium'
import { useCesium } from 'resium'
import { useLatest } from 'ahooks'
import { useShallow } from 'zustand/react/shallow'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

type PropsType = {
  homePoint: number[]
  point1: number[]
}

/** 起飞点连接线 */
const HomePathLine: FC<PropsType> = ({ homePoint, point1 }) => {
  const { viewer } = useCesium()

  const config = useAirlineConfigStore(
    useShallow((s) => ({
      flyToWaylineMode: s.airlineConfig.flyToWaylineMode,
      takeOffSecurityHeight: s.airlineConfig.takeOffSecurityHeight,
    })),
  )

  const configRef = useLatest(config)

  useEffect(() => {
    if (!viewer?.scene) return

    const positions = new Cesium.CallbackProperty((_, result) => {
      let positions

      if (configRef.current.flyToWaylineMode === 'safely') {
        // 垂直爬升
        positions = [
          Cesium.Cartesian3.fromDegrees(
            homePoint[0],
            homePoint[1],
            homePoint[2],
          ),
          Cesium.Cartesian3.fromDegrees(
            homePoint[0],
            homePoint[1],
            Math.max(configRef.current.takeOffSecurityHeight, point1[2]),
          ),
          Cesium.Cartesian3.fromDegrees(
            point1[0],
            point1[1],
            Math.max(configRef.current.takeOffSecurityHeight, point1[2]),
          ),
          Cesium.Cartesian3.fromDegrees(point1[0], point1[1], point1[2]),
        ]
      } else {
        // 倾斜爬升
        positions = [
          Cesium.Cartesian3.fromDegrees(
            homePoint[0],
            homePoint[1],
            homePoint[2],
          ),
          Cesium.Cartesian3.fromDegrees(
            homePoint[0],
            homePoint[1],
            Math.min(configRef.current.takeOffSecurityHeight, point1[2]),
          ),
          Cesium.Cartesian3.fromDegrees(point1[0], point1[1], point1[2]),
        ]
      }

      if (Cesium.defined(result)) {
        result.length = 0 // 清空现有数组
        result.push(...positions)
      }
      return positions
    }, false)

    const entity = viewer.entities.add({
      polyline: {
        positions,
        width: 4,
        material: Cesium.Color.fromCssColorString('#03D68F'),
      },
    })

    return () => {
      try {
        viewer?.entities?.remove(entity)
      } catch (error) {}
    }
  }, [homePoint, point1])

  return <></>
}

export default memo(HomePathLine)
