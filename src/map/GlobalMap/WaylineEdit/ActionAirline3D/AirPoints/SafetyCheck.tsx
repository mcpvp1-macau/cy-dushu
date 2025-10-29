import useAirlineConfigStore, {
  Warning,
} from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { computeRayTerrainIntersection } from '@/utils/cesium/computeRayTerrainIntersection'
import { getSpaceDistance } from '@/utils/geo-math'
import { useDebounceEffect } from 'ahooks'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { useShallow } from 'zustand/react/shallow'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { shouldJson } from '@/utils/json'
import * as turf from '@turf/turf'

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

  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)

  const noFlyZones = useMemo(
    () =>
      flightAreaList
        .filter(
          (e) =>
            e.overlayExtType === 'NO_FLY_ZONE' &&
            ['POLYGON', 'CIRCULAR'].includes(e.overlayType),
        )
        .map((e) => {
          const positions = shouldJson(e.overlayPositions)
          if (e.overlayType === 'POLYGON') {
            const polygon = turf.polygon([
              [...positions, positions[0]].map((p) => [p[0], p[1]]),
            ])
            return polygon
          }
          const circle = turf.circle(
            [positions[0][0], positions[0][1]],
            positions[0][3],
            { units: 'meters', steps: 64 },
          )
          return circle
        }),
    [flightAreaList],
  )

  // 判断飞行路径是否经过禁飞区
  useDebounceEffect(
    () => {
      if (airpoints.length === 0) {
        return
      }
      const polylineOrPoint =
        airpoints.length > 1
          ? turf.lineString(airpoints.map((p) => [p.pointX, p.pointY]))
          : turf.point([airpoints[0].pointX, airpoints[0].pointY])

      const inNoFlyZone = noFlyZones.some((zone) =>
        turf.booleanIntersects(polylineOrPoint, zone),
      )
      const prev = useAirlineConfigStore.getState().warningSet
      if (inNoFlyZone) {
        if (!prev.has(Warning.InNoFlyZone)) {
          const newSet = new Set(prev)
          newSet.add(Warning.InNoFlyZone)
          updateWarningSet(newSet)
        }
      } else {
        if (prev.has(Warning.InNoFlyZone)) {
          const newSet = new Set(prev)
          newSet.delete(Warning.InNoFlyZone)
          updateWarningSet(newSet)
        }
      }
    },
    [airpoints, noFlyZones],
    { wait: 1000 },
  )

  return null
})

SafetyCheck.displayName = 'SafetyCheck'

export default SafetyCheck
