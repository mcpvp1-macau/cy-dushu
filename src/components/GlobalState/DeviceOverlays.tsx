import { getDeviceOverlay } from '@/service/modules/device-zone'
import useDeviceOverlaiesStore from '@/store/map/useDeviceOverlays.store'

type PropsType = unknown

const DeviceOverlays: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()
  const { data } = useQuery(
    {
      queryKey: ['getDeviceOverlayList'],
      queryFn: () => getDeviceOverlay(),
      select: (d) => d.data.rows,
      enabled: true,
    },
    queryClient,
  )

  useEffect(() => {
    if (!data) {
      return
    }
    const deviceOverlaies = data.reduce(
      (acc, item) => ({
        ...acc,
        [item.deviceId]: acc[item.deviceId]
          ? [...acc[item.deviceId], item]
          : [item],
      }),
      {},
    )

    useDeviceOverlaiesStore.getState().updateDeviceOverlays(deviceOverlaies)
  }, [data])

  return null
})

DeviceOverlays.displayName = 'DeviceOverlays'

export default DeviceOverlays
