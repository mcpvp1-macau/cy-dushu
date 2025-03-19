import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import Waypoint from './Waypoint'
import PathLine from './PathLine'

type PropsType = unknown

const Waypoints: FC<PropsType> = memo(() => {
  const waypoints = useRebotDogWaylineStore((s) => s.waypointsConfig)

  return (
    <>
      {/* 航点 */}
      {waypoints.map((point: any) => (
        <Waypoint key={point.xid} point={point} />
      ))}
      {/* 航点之间的连线 */}
      {waypoints.map((point, i) => {
        const nextPoint = waypoints[i + 1]
        if (!nextPoint) {
          return null
        }
        return (
          <PathLine key={`${point.xid}`} point1={point} point2={nextPoint} />
        )
      })}
    </>
  )
})

Waypoints.displayName = 'Waypoints'

export default Waypoints
