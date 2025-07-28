import useReconstructionMapStore, {
  useReconstructionMapConfigStore,
} from '@/store/map/useReconstructionMap.store'
import { lazy } from 'react'

const ReconstructionDraw = lazy(() => import('./ReconstructionDraw'))

type PropsType = unknown

/** 三维重建图层 */
const ReconstructionLayer: FC<PropsType> = memo(() => {
  const layerList = useReconstructionMapStore((s) => s.layerList)
  const showLayerIds = useReconstructionMapConfigStore((s) => s.showLayerIds)
  const [isLoaded, setIsLoaded] = useState(false)

  const has = useMemo(() => {
    for (const overlay of layerList) {
      if (showLayerIds.has(overlay.overlayId)) {
        return true
      }
    }
    return false
  }, [layerList, showLayerIds])

  useEffect(() => {
    if (has) {
      setIsLoaded(true)
    }
  }, [has])

  if (!has && !isLoaded) {
    return null
  }

  return (
    <ReconstructionDraw layerList={layerList} showLayerIds={showLayerIds} />
  )
})

ReconstructionLayer.displayName = 'ReconstructionLayer'

export default ReconstructionLayer
