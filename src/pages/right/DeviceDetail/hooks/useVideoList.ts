import { dft } from '@/constant/time-fmt'
import { getDeviceVideo } from '@/service/modules/db-api'
import { getHistoryM3u8Video, getHistoryVideo2 } from '@/service/modules/device'
import { Dayjs } from 'dayjs'

const useVideoList = (
  productKey: string,
  deviceId: string,
  videoId: string,
  type: 'platform' | 'device',
  deviceType: string,
  date: [Dayjs, Dayjs] | Dayjs,
) => {
  const queryClient = useQueryClient()

  const { startTime, endTime } = useMemo(() => {
    if (Array.isArray(date)) {
      //
      return {
        startTime: date[0].format(dft),
        endTime: date[1].format(dft),
      }
    } else {
      return {
        startTime: date.format(dft),
        endTime: date.format(dft),
      }
    }
  }, [date])

  // 根据类型选择请求函数
  const queryFn = useMemo(() => {
    if (type === 'device') {
      return async () => {
        const resp = await getDeviceVideo({
          deviceId,
          type: 'VIDEO',
          sourceId: 'ALL',
          page: 1,
          pageSize: 100,
          startTime,
          endTime,
          sort: 'asc',
        })
        return resp.data[0]
      }
    }
    return deviceType === 'WANGLOU'
      ? async () => {
          const resp = await getHistoryM3u8Video(
            productKey,
            deviceId,
            videoId!,
            {
              startTime,
              endTime,
              isProxy: true,
              proxyPrefix: '/_proxy/',
            },
          )
          return resp.data.videoList
        }
      : async () => {
          const resp = await getHistoryVideo2(productKey, deviceId, videoId!, {
            startTime,
            endTime,
            isProxy: true,
            proxyPrefix: '/_proxy/',
          })
          return resp.data.videoList
        }
  }, [productKey, deviceId, videoId, deviceType, type, date])

  const { data: videoList, isLoading } = useQuery(
    {
      queryKey: [
        'getHistoryVideo',
        type,
        deviceId,
        {
          startTime,
          endTime,
        },
      ],
      queryFn,
      enabled: !!videoId && !!date,
      // select: (d) => d.data.videoList,
    },
    queryClient,
  )
  return { videoList, isLoading }
}

export default useVideoList
