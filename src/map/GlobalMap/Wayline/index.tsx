import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import useSwarmWaylineStore from '@/store/uav/uav-swarm-wayline/useSwarmWayline.store'
import { lazy } from 'react'

const ActionAirline = lazy(() => import('./ActionAirline3D'))
const AreaWayline = lazy(() => import('./AreaWayline'))
const SwarmWayline = lazy(() => import('./SwarmWayline'))

/** 航线相关 */
const Waylines: FC<unknown> = memo(() => {
  const airlineOpen = useAirlineConfigStore((s) => s.open)
  const areaWaylineOpen = useAreaWaylineStore((s) => s.open)
  const swarmWaylineOpen = useSwarmWaylineStore((s) => s.open)

  return (
    <>
      {airlineOpen && <ActionAirline />}
      {areaWaylineOpen && <AreaWayline />}
      {swarmWaylineOpen && <SwarmWayline />}
    </>
  )
})

export default Waylines
