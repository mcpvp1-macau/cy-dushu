import { WaylineEnum } from '@/constant/uav/wayline'
import UavWayline from '@/map/CesiumMap/components/service/Wayline/UavAirline'
import UavAreaWayline from '@/map/CesiumMap/components/service/Wayline/UavAreaWayline'
import useWaylinesStore from '@/store/map/useWaylines.store'

type PropsType = unknown

const Waylines: FC<PropsType> = memo(() => {
  const waylines = useWaylinesStore((s) => s.waylines)

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
      })}
    </>
  )
})

Waylines.displayName = 'Waylines'

export default Waylines
