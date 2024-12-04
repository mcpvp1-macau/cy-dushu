import useMixARStore from '@/store/control-room/useMixAR.store'
import { memo, type FC } from 'react'
import ARScenePOI from './POI'
import { BillboardCollection, LabelCollection } from 'resium'

type PropsType = unknown

const ARScenePOIs: FC<PropsType> = memo(() => {
  const pois = useMixARStore((s) => s.pois)

  return (
    <>
      <BillboardCollection>
        <LabelCollection>
          {pois.map((poi) => {
            return <ARScenePOI key={poi.id} data={poi} />
          })}
        </LabelCollection>
      </BillboardCollection>
    </>
  )
})

ARScenePOIs.displayName = 'ARScenePOIs'

export default ARScenePOIs
