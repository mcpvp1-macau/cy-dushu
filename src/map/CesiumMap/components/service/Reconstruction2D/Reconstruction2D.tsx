import TiffLoader32650 from '../common/TiffLoader32650'
import Reconstruction2DCollection from './Reconstruction2DCollection'
import Reconstruction2DItem from './Reconstruction2DItem'
import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'

type PropsType = unknown

const Reconstruction2D: FC<PropsType> = memo(() => {
  const processResults = useReconstruction2DMapStore((s) => s.processedResults)

  return (
    <Reconstruction2DCollection>
      {processResults.map((e) =>
        e.imgType === 'jpeg' ? (
          <Reconstruction2DItem key={e.imgUrl} data={e} />
        ) : e.imgType === 'tiff' ? (
          <TiffLoader32650 key={e.imgUrl} url={e.imgUrl} />
        ) : null,
      )}
    </Reconstruction2DCollection>
  )
})

Reconstruction2D.displayName = 'Reconstruction2D'

export default Reconstruction2D
