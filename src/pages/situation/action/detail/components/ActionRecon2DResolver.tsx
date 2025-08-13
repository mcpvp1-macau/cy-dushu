import useQueryHistoryReconstruction2DProcessedResult from '@/hooks/service/reconstruction/useQueryHistoryReconstruction2DProcessedResult'
import { useListenRealProcessedResults } from '@/store/map/useReconstruction2DMap.store'

type PropsType = {
  actionId: number
}

/** 处理 二维重建 相关 */
const Reconstruction2DResolver: FC<PropsType> = memo(({ actionId }) => {
  // useQueryHistoryReconstruction2DProcessedResult({ actionId })
  useListenRealProcessedResults((_, actId) => actId === Number(actionId ?? 0))

  return null
})

Reconstruction2DResolver.displayName = 'Reconstruction2DResolver'

export default Reconstruction2DResolver
