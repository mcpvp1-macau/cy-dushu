// 注意：本来应该是 hooks，因为需要条件来决定是否存在，所有改成 组件
import { dft } from '@/constant/time-fmt'
import { getTrackQuery } from '@/service/modules/db-api'
import { useDeviceDetailStore } from '../../hooks/useDeviceDetail.store'
import { pathCompress } from '@/utils/path'
import useHistoryTrackStore from '@/store/map/useHistoryTrack.store'

/** 最近一天的轨迹，同步在地图上 */
const UsePrevDayHisTrack = memo(() => {
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

  return null
})

UsePrevDayHisTrack.displayName = 'UsePrevDayHisTrack'

export default UsePrevDayHisTrack
