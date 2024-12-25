import useMixARStore from '@/store/control-room/useMixAR.store'
import ARSceneAOI from './AOI'
import usePrimitiveCollection from '../hooks/usePrimitiveCollection'

type PropsType = unknown

const ARSceneAOIs: FC<PropsType> = memo(() => {
  const aois = useMixARStore((s) => s.aois)

  const primitiveCollection = usePrimitiveCollection(0)

  if (!primitiveCollection) {
    return
  }

  return (
    <>
      {aois.map((aoi, i) => (
        <ARSceneAOI key={i} data={aoi} collection={primitiveCollection} />
      ))}
    </>
  )
})

ARSceneAOIs.displayName = 'ARSceneAOIs'

export default ARSceneAOIs
