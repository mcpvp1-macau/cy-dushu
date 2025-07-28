import Reconstruction2DCollection from './Reconstruction2DCollection'
import Reconstruction2DItem from './Reconstruction2DItem'
import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'
import TiffWMTSLoader4326 from '../common/TiffWMTSLoader4326'

type PropsType = unknown

const Reconstruction2D: FC<PropsType> = memo(() => {
  const processResults = useReconstruction2DMapStore((s) => s.processedResults)

  return (
    <Reconstruction2DCollection>
      {processResults.map((e) =>
        e.imgType === 'jpeg' ? (
          <Reconstruction2DItem key={e.imgUrl} data={e} />
        ) : e.imgType === 'tiff' ? (
          e.layer &&
          e.bboxMinX &&
          e.bboxMaxX &&
          e.bboxMinY &&
          e.bboxMaxY && (
            <TiffWMTSLoader4326
              key={e.imgUrl}
              layer={e.layer}
              bboxMinX={e.bboxMinX}
              bboxMinY={e.bboxMinY}
              bboxMaxX={e.bboxMaxX}
              bboxMaxY={e.bboxMaxY}
            />
          )
        ) : null,
      )}
    </Reconstruction2DCollection>
  )
})

Reconstruction2D.displayName = 'Reconstruction2D'

export default Reconstruction2D
