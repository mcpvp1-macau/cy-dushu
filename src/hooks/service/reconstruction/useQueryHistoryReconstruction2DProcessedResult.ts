import { getGimbalInfo } from '@/constant/uav/gimbalV2'
import { getReconstruction2DList } from '@/service/modules/reconstruction'
import type { ProcessedResultType } from '@/store/map/useReconstruction2DMap.store'
import useReconstruction2DMapStore from '@/store/map/useReconstruction2DMap.store'
import { isNil } from 'lodash'

/** 获取历史二维重建过程 */
const useQueryHistoryReconstruction2DProcessedResult = (queryData: {
  deviceId?: string
  actionId?: number
}) => {
  // 二维重建 ---------------------------------------------------------------------
  const queryClient = useQueryClient()
  const { data: data2dList } = useQuery(
    {
      queryKey: ['reconstruction2dList', queryData],
      queryFn: () =>
        getReconstruction2DList({ ...queryData, needProcess: true }),
      select: (d) => d.data,
    },
    queryClient,
  )
  useEffect(() => {
    if (!data2dList?.length) {
      return
    }
    if (data2dList[0].process && data2dList[0].status === '"PROCESSING"') {
      const processedResults: ProcessedResultType[] = []
      for (const item of data2dList.at(-1)!.process ?? []) {
        if (item.imageType === 'tiff') {
          processedResults.length = 0
          processedResults.push({
            imgUrl: item.imageUrl,
            lon: 0,
            lat: 0,
            alt: 0,
            yaw: 0,
            pitch: 0,
            roll: 0,
            focal: 0,
            width: 0,
            aspectRatio: 1,
            zoomFactor: 1,
            imgType: 'tiff',
          })
          continue
        }
        const meta = item.meta || {}
        if (
          isNil(meta.gpsLongitude) ||
          isNil(meta.gpsLatitude) ||
          isNil(meta.gimbalPitch) ||
          isNil(meta.gimbalYaw) ||
          isNil(meta.gimbalRoll) ||
          isNil(meta.productName) ||
          isNil(meta.absoluteAltitude)
        ) {
          continue
        }
        const g = getGimbalInfo(meta.productName)
        processedResults.push({
          imgUrl: item.imageUrl,
          lon: meta.gpsLongitude,
          lat: meta.gpsLatitude,
          alt: meta.absoluteAltitude,
          yaw: meta.gimbalYaw,
          pitch: meta.gimbalPitch,
          roll: meta.gimbalRoll,
          focal: g.wide.focal,
          width: g.wide.width,
          aspectRatio: g.wide.width / g.wide.height,
          zoomFactor: 1,
          imgType: 'jpeg',
        })
      }
      useReconstruction2DMapStore
        .getState()
        .updateProcessedResults(processedResults)
    }
  }, [data2dList])
}

export default useQueryHistoryReconstruction2DProcessedResult
