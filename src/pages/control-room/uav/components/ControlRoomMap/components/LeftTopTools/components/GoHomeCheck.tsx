import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useShallow } from 'zustand/react/shallow'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import * as turf from '@turf/turf'
import { shouldJson } from '@/utils/json'

type PropsType = unknown

const GoHomeCheckInfo: FC<PropsType> = memo(() => {
  const coords = useUavControlRoomStore(
    useShallow((s) => ({
      uavLon: s.state.longitude,
      uavLat: s.state.latitude,
      homeLon: s.state.gohomeLongitude,
      homeLat: s.state.gohomeLatitude,
    })),
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

  const goHomeLineCross = useMemo(() => {
    if (
      !coords.uavLon ||
      !coords.uavLat ||
      !coords.homeLon ||
      !coords.homeLat
    ) {
      return false
    }
    const line = turf.lineString([
      [coords.uavLon, coords.uavLat],
      [coords.homeLon, coords.homeLat],
    ])
    return noFlyZones.some((e) => turf.booleanIntersects(e, line))
  }, [coords, noFlyZones])

  if (!goHomeLineCross) {
    return null
  }

  return (
    <div className="text-sm h-8 leading-8 px-2 flex justify-center items-center bg-[#DD4444] rounded-[3px] truncate">
      当前无人机返航路线可能经过禁飞区
    </div>
  )
})

GoHomeCheckInfo.displayName = 'GoHomeCheck'

export default GoHomeCheckInfo
