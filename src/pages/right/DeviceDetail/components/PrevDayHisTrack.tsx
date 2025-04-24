// 注意：本来应该是 hooks，因为需要条件来决定是否存在，所有改成 组件
import { dft } from '@/constant/time-fmt'
import { getTrackQuery } from '@/service/modules/db-api'
import { useDeviceDetailStore } from '../hooks/useDeviceDetail.store'
import { pathCompress3D } from '@/utils/path'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

/** 最近一天的轨迹，同步在地图上 */
const UsePrevDayHisTrack = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const queryClient = useQueryClient()
  const [startTime, endTime] = useMemo(() => {
    return [dayjs().subtract(24, 'hours').format(dft), dayjs().format(dft)]
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

  // const updateTracks = useHistoryTrackStore((s) => s.updateTracks)
  const updateTracks = useMapDevicesStore((s) => s.updateUavTracks)

  useEffect(() => {
    if (!data || !data.data) {
      return
    }
    const res = pathCompress3D(
      data.data.map((e) => ({
        lng: e.lng,
        lat: e.lat,
        alt: e.altitude,
      })),
    )
    if (!res.length) {
      return
    }
    updateTracks({
      ...useMapDevicesStore.getState().uavTracks,
      [deviceId]: {
        path: res,
        useCallback: false,
      },
    })
    return () => {
      const newTracks = {
        ...useMapDevicesStore.getState().uavTracks,
      }
      delete newTracks[deviceId]
      updateTracks(newTracks)
    }
  }, [data, deviceId])

  return null
})

UsePrevDayHisTrack.displayName = 'UsePrevDayHisTrack'

export default UsePrevDayHisTrack
