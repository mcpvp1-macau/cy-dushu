import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'
import Reconstruction2DResultItem from './Reconstruction2DResult'

type PropsType = unknown

const Reconstruction2DResultList: FC<PropsType> = memo(() => {
  const results = useReconstruction2DMapStore((s) => s.reconstruction2DList)

  return results.map((e) => <Reconstruction2DResultItem key={e.id} data={e} />)
})

Reconstruction2DResultList.displayName = 'ReconstructionResults'

export default Reconstruction2DResultList
