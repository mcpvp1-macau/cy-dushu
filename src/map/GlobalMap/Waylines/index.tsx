import { WaylineEnum } from '@/constant/uav/wayline'
import UavWayline from '@/map/CesiumMap/components/service/Wayline/UavAirline'
import UavAreaWayline from '@/map/CesiumMap/components/service/Wayline/UavAreaWayline'
import useWaylinesStore from '@/store/map/useWaylines.store'
import GroundPolygon from '@/map/CesiumMap/components/service/common/GroundPolygon'
import GroundWayline from '@/map/CesiumMap/components/service/Wayline/GroundWayline'

type PropsType = unknown

const Waylines: FC<PropsType> = memo(() => {
  const waylines = useWaylinesStore((s) => s.waylines)

  const swarmPolygons = useWaylinesStore((s) => s.swarmPolygons)

  return (
    <>
      {waylines.map((e) => {
        if (e.type === WaylineEnum.PointWayline) {
          return <UavWayline key={e.id} data={e.points} />
        }
        if (e.type === WaylineEnum.AreaWayline) {
          return (
            <UavAreaWayline
              key={e.id}
              data={e.points}
              taskBasic={e.taskBasic}
            />
          )
        }
        if (e.type === WaylineEnum.RebotDogWayline) {
          return <GroundWayline key={e.id} data={e.points} />
        }
      })}
      {swarmPolygons.map((e) => {
        return (
          <GroundPolygon
            key={e.id}
            positions={e.points}
            fillColor="#3b82f61f"
            outlineColor="#3b82f699"
          />
        )
      })}
    </>
  )
})

Waylines.displayName = 'Waylines'

export default Waylines
