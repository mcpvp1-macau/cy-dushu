import useAirlineConfigStore, {
  Warning,
} from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { computeRayTerrainIntersection } from '@/utils/cesium/computeRayTerrainIntersection'
import { getSpaceDistance } from '@/utils/geo-math'
import { useDebounceEffect } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useShallow } from 'zustand/react/shallow'

type P = {
  pointX: number
  pointY: number
  pointZ: number
}

type PropsType = {
  airpoints: P[]
  takeOffRefPoint: number[]
}

const SafetyCheck: FC<PropsType> = memo(({ airpoints, takeOffRefPoint }) => {
  const updateWarningSet = useAirlineConfigStore((s) => s.updateWarningSet)
  const { viewer } = useCesium()

  const config = useAirlineConfigStore(
    useShallow((s) => ({
      flyToWaylineMode: s.airlineConfig.flyToWaylineMode,
      takeOffSecurityHeight: s.airlineConfig.takeOffSecurityHeight,
    })),
  )

  const calc = useMemoizedFn((p1: P, p2: P, set: Set<Warning>) => {
    if (!viewer) {
      return
    }
    const p1Cartographic = Cesium.Cartographic.fromDegrees(
      p1.pointX,
      p1.pointY,
      p1.pointZ,
    )
    const p2Cartographic = Cesium.Cartographic.fromDegrees(
      p2.pointX,
      p2.pointY,
      p2.pointZ,
    )

    if (
      (viewer.scene.globe.getHeight(p2Cartographic) ?? -0x3f3f3f3f) >
      p2Cartographic.height
    ) {
      set.add(Warning.CollisionTerrain)
    }

    if (computeRayTerrainIntersection(p1Cartographic, p2Cartographic, viewer)) {
      set.add(Warning.CollisionTerrain)
    }
    if (
      !set.has(Warning.CollisionTerrain) &&
      computeRayTerrainIntersection(
        Cesium.Cartographic.fromDegrees(p1.pointX, p1.pointY, p1.pointZ - 20),
        Cesium.Cartographic.fromDegrees(p2.pointX, p2.pointY, p2.pointZ - 20),
        viewer!,
      )
    ) {
      set.add(Warning.NearTerrain)
    }
  })

  useDebounceEffect(
    () => {
      const set = new Set<Warning>()
      if (airpoints.length === 0) {
        updateWarningSet(set)
        return
      }

      if (config.flyToWaylineMode === 'safely') {
        const p1 = {
          pointX: takeOffRefPoint[0],
          pointY: takeOffRefPoint[1],
          pointZ: Math.max(
            config.takeOffSecurityHeight + takeOffRefPoint[2],
            airpoints[0].pointZ,
          ),
        }
        const p2 = {
          pointX: airpoints[0].pointX,
          pointY: airpoints[0].pointY,
          pointZ: Math.max(
            config.takeOffSecurityHeight + takeOffRefPoint[2],
            airpoints[0].pointZ,
          ),
        }

        calc(p1, p2, set)
      }

      for (let i = 1; i < airpoints.length; i++) {
        const p1 = airpoints[i - 1]
        const p2 = airpoints[i]
        const d = getSpaceDistance([
          [p1.pointX, p1.pointY, p1.pointZ],
          [p2.pointX, p2.pointY, p2.pointZ],
        ])
        if (d > 2000) {
          set.add(Warning.DistanceBetweenWaypoints)
        }

        calc(p1, p2, set)
      }
      updateWarningSet(set)
    },
    [airpoints, takeOffRefPoint, viewer, calc, config],
    {
      wait: 500,
    },
  )

  return null
})

SafetyCheck.displayName = 'SafetyCheck'

export default SafetyCheck
