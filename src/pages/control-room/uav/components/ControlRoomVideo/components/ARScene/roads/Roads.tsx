import useMixARStore from '@/store/control-room/useMixAR.store'
import { memo, type FC } from 'react'
import ARSenceRoad from './Road'
import usePrimitiveCollection from '../hooks/usePrimitiveCollection'

type PropsType = unknown

const ARSceneRoads: FC<PropsType> = memo(() => {
  const roads = useMixARStore((s) => s.roads)
  const primitiveCollection = usePrimitiveCollection(1)

  if (!primitiveCollection) {
    return null
  }

  return (
    <>
      <>
        {roads.map((road) => {
          return (
            <ARSenceRoad
              key={road.id}
              data={road}
              width={7}
              color="#000000"
              collection={primitiveCollection}
            />
          )
        })}
      </>
      <>
        {roads.map((road) => {
          return (
            <ARSenceRoad
              key={road.id}
              data={road}
              collection={primitiveCollection}
            />
          )
        })}
      </>
    </>
  )
})

ARSceneRoads.displayName = 'ARSceneRoads'

export default ARSceneRoads
