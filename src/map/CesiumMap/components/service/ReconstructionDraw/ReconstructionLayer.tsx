import useReconstructionMapStore, {
  useReconstructionMapConfigStore,
} from '@/store/map/useReconstructionMap.store'
import { lazy } from 'react'

const ReconstructionDraw = lazy(() => import('./ReconstructionDraw'))

type PropsType = unknown

/** 三维重建图层 */
const ReconstructionLayer: FC<PropsType> = memo(() => {
  const layerList = useReconstructionMapStore((s) => s.layerList)
  const [showLayerIds, showGroupIds] = useReconstructionMapConfigStore((s) => [
    s.showLayerIds,
    s.showGroupIds,
  ])

  const has = useMemo(() => {
    for (const overlay of layerList) {
      if (
        showLayerIds.has(overlay.overlayId) &&
        showGroupIds.has(overlay.layerId)
      ) {
        return true
      }
    }
    return false
  }, [layerList, showLayerIds, showGroupIds])

  if (!has) {
    return null
  }

  return (
    <ReconstructionDraw
      layerList={layerList}
      showLayerIds={showLayerIds}
      showGroupIds={showGroupIds}
    />
  )
})

ReconstructionLayer.displayName = 'ReconstructionLayer'

export default ReconstructionLayer
