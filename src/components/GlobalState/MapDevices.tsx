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
  const updateAirportDevices = useMapDevicesStore((s) => s.updateAirportDevices)
  const updateRobotDogDevices = useMapDevicesStore(
    (s) => s.updateRobotDogDevices,
  )
  const updateOtherDevices = useMapDevicesStore((s) => s.updateOtherDevices)
  const updateAllDevices = useMapDevicesStore((s) => s.updateAllDevices)
  const updateAllDevicesMap = useMapDevicesStore((s) => s.updateAllDevicesMap)
  useEffect(() => {
    if (!data) {
      return
    }
    // 更新所有设备
    updateAllDevices(data)

    // 过滤 + 分组
    const m = {
      [DeviceEnum.UAV]: DeviceEnum.UAV,
      [DeviceEnum.WANGLOU]: DeviceEnum.WANGLOU,
      [DeviceEnum.UAV_AIRPORT]: DeviceEnum.UAV_AIRPORT,
      [DeviceEnum.ROBOT_DOG]: DeviceEnum.ROBOT_DOG,
    }

    const g = groupBy(
      data.filter((e) => checkGeo(e.longitude, e.latitude)),
      (e) => m[e.deviceType] || 'other',
    )

    updateUavDevices(g[DeviceEnum.UAV] || [])
    updateWangloutDevices(g[DeviceEnum.WANGLOU] || [])
    updateAirportDevices(g[DeviceEnum.UAV_AIRPORT] || [])
    updateRobotDogDevices(g[DeviceEnum.ROBOT_DOG] || [])
    updateOtherDevices(g['other'] || [])

    const gm = groupBy(data, (e) => e.deviceId)
    updateAllDevicesMap(gm)
  }, [data])

  return null
})

MapDevices.displayName = 'MapDevices'

export default MapDevices
