import { DeviceEnum } from '@/enum/device'
import { getAllDeviceListV3 } from '@/service/modules/device'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { checkGeo } from '@/utils/geo/check-geo'
import { groupBy } from 'lodash'

type PropsType = unknown

const MapDevices: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()

  const { data } = useQuery(
    {
      queryKey: ['map-device-list'],
      queryFn: () => getAllDeviceListV3({}),
      select: (d) => d.data.rows,
      retry: 8,
      refetchOnWindowFocus: false,
    },
    queryClient,
  )

  const updateUavDevices = useMapDevicesStore((s) => s.updateUavDevices)
  const updateWangloutDevices = useMapDevicesStore(
    (s) => s.updateWangloutDevices,
  )
  const updateOtherDevices = useMapDevicesStore((s) => s.updateOtherDevices)
  const updateAirportDevices = useMapDevicesStore((s) => s.updateAirportDevices)

  useEffect(() => {
    if (!data) {
      return
    }
    const m = {
      [DeviceEnum.UAV]: DeviceEnum.UAV,
      [DeviceEnum.WANGLOU]: DeviceEnum.WANGLOU,
      [DeviceEnum.UAV_AIRPORT]: DeviceEnum.UAV_AIRPORT,
    }
    const g = groupBy(
      data.filter((e) => checkGeo(e.longitude, e.latitude)),
      (e) => m[e.deviceType] || 'other',
    )
    updateUavDevices(g[DeviceEnum.UAV] || [])
    updateWangloutDevices(g[DeviceEnum.WANGLOU] || [])
    updateAirportDevices(g[DeviceEnum.UAV_AIRPORT] || [])
    updateOtherDevices(g['other'])
  }, [data])

  return null
})

MapDevices.displayName = 'MapDevices'

export default MapDevices
