import { dft } from '@/constant/time-fmt'
import { getHistoryVideo, getHistoryM3u8Video } from '@/service/modules/device'
import { Dayjs } from 'dayjs'

const useVideoList = (
  productKey: string,
  deviceId: string,
  videoId: string,
  deviceType: string,
  date: [Dayjs, Dayjs] | Dayjs,
) => {
  const queryClient = useQueryClient()
  const post = deviceType === 'WANGLOU' ? getHistoryM3u8Video : getHistoryVideo
  const { startTime, endTime } = useMemo(() => {
    if (Array.isArray(date)) {
      //
      return {
        startTime: date[0].startOf('day').format(dft),
        endTime: date[1].endOf('day').format(dft),
      }
    } else {
      return {
        startTime: date.startOf('day').format(dft),
        endTime: date.endOf('day').format(dft),
      }
    }
  }, [date])

  const { data: videoList, isLoading } = useQuery(
    {
      queryKey: [
        'getHistoryVideo',
        deviceId,
        {
          startTime,
          endTime,
        },
      ],
      queryFn: () =>
        post(productKey, deviceId, videoId!, {
          startTime,
          endTime,
          isProxy: true,
          proxyPrefix: '/_proxy/',
        }),
      enabled: !!videoId && !!date,
      select: (d) => d.data.videoList,
    },
    queryClient,
  )
  return { videoList, isLoading }
}

export default useVideoList
