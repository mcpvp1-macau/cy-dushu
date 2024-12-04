import useMixARStore from '@/store/control-room/useMixAR.store'
import { memo, type FC } from 'react'
import ARSenceRoad from './Road'

type PropsType = unknown

const ARSceneRoads: FC<PropsType> = memo(() => {
  const roads = useMixARStore((s) => s.roads)

  return (
    <>
      {roads.map((road) => {
        return <ARSenceRoad key={road.id} data={road} />
      })}
    </>
  )
})

ARSceneRoads.displayName = 'ARSceneRoads'

export default ARSceneRoads
