import { dft } from '@/constant/time-fmt'
import { getTrackQuery } from '@/service/modules/db-api'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { pathCompress } from '@/utils/path'
import useHistoryTrackStore from '@/store/map/useHistoryTrack.store'

/** 获取设备最近一天的轨迹 */
const usePrevDayHisTrack = () => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const queryClient = useQueryClient()
  const [startTime, endTime] = useMemo(() => {
    return [dayjs().subtract(1, 'day').format(dft), dayjs().format(dft)]
  }, [])

  const { data } = useQuery(
    {
      queryKey: [
        'trackQuery',
        {
          deviceId,
          startTime,
          endTime,
        },
      ],
      queryFn: () => getTrackQuery({ deviceId: deviceId!, startTime, endTime }),
      enabled: !!deviceId,
    },
    queryClient,
  )

  const updateTracks = useHistoryTrackStore((s) => s.updateTracks)

  useEffect(() => {
    if (!data || !data.data) {
      return
    }
    const res = pathCompress(data.data)
    if (!res.length) {
      updateTracks([])
      return
    }
    updateTracks([
      {
        id: res[0].deviceId,
        path: res,
      },
    ])
    return () => {
      updateTracks([])
    }
  }, [data])
}

export default usePrevDayHisTrack
