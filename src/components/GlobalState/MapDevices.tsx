import { FIXED_WING_DEMO_DEVICES } from '@/demo/fixed-wing/constants'
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

  useEffect(() => {
    if (!data) {
      return
    }
    // 固定翼无人机纯前端演示设备
    // 演示模式下 data 已包含完整机队(含固定翼), 无需重复追加
    const renderData =
      globalConfig.useFixedWingDemo && !globalConfig.demoMode
        ? [...data, ...FIXED_WING_DEMO_DEVICES]
        : data
    const store = useMapDevicesStore.getState()
    // 更新所有设备
    store.updateAllDevices(renderData)
    store.updateDeviceMap(
      renderData.reduce((acc, cur) => {
        acc[cur.deviceId] = cur
        return acc
      }, {}),
    )

    // 过滤 + 分组
    const m = {
      [DeviceEnum.UAV]: DeviceEnum.UAV,
      [DeviceEnum.WANGLOU]: DeviceEnum.WANGLOU,
      [DeviceEnum.UAV_AIRPORT]: DeviceEnum.UAV_AIRPORT,
      [DeviceEnum.ROBOT_DOG]: DeviceEnum.ROBOT_DOG,
      [DeviceEnum.CAMERA]: DeviceEnum.CAMERA,
    }

    const g = groupBy(
      renderData.filter((e) => checkGeo(e.longitude, e.latitude)),
      (e) => m[e.deviceType] || 'other',
    )

    store.updateUavDevices(g[DeviceEnum.UAV] || [])
    store.updateWangloutDevices(g[DeviceEnum.WANGLOU] || [])
    store.updateAirportDevices(g[DeviceEnum.UAV_AIRPORT] || [])
    store.updateRobotDogDevices(g[DeviceEnum.ROBOT_DOG] || [])
    store.updateCameraDevices(g[DeviceEnum.CAMERA] || [])
    store.updateOtherDevices(g['other'] || [])

    const gm = groupBy(renderData, (e) => e.deviceId)
    store.updateAllDevicesMap(gm)
  }, [data])

  return null
})

MapDevices.displayName = 'MapDevices'

export default MapDevices
