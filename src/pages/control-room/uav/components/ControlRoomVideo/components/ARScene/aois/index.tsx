import useMixARStore from '@/store/control-room/useMixAR.store'
import { memo, type FC } from 'react'
import ARSceneAOI from './AOI'

type PropsType = unknown

const ARSceneAOIs: FC<PropsType> = memo(() => {
  const aois = useMixARStore((s) => s.aois)

  return (
    <>
      {aois.map((aoi) => (
        <ARSceneAOI key={aoi.id} data={aoi} />
      ))}
    </>
  )
})

ARSceneAOIs.displayName = 'ARSceneAOIs'

export default ARSceneAOIs
