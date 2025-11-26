import icon from '/images/marker/icon/uav_dock.svg'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import {
  useRealOnlineStatus,
  useRealTaskStatus,
} from '@/store/useGlobalWebSocket.store'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import useDeviceFilterConfigStore from '@/store/useDeviceFilterConfig.store'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import useGroundHeight from '@/hooks/cesium/useGroundHeight'
import DeviceOverlays from '../components/DeviceOverlays'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const UavAirportMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data

  // 机库刷新经纬度频率很低，所以这里不用获取实时数据了~
  const lng = data.longitude ?? 0
  const lat = data.latitude ?? 0

  const onlineStatus = useRealOnlineStatus(deviceId)
  const taskStatus = useRealTaskStatus(deviceId)

  const isOnline = useDeviceFilterConfigStore((s) => s.isOnline)
  const isTask = useDeviceFilterConfigStore((s) => s.isTask)
  const isNotTask = useDeviceFilterConfigStore((s) => s.isNotTask)
  const isHidden = useDeviceFilterConfigStore(
    (s) => s.hiddenDeviceIds[deviceId],
  )

  const groundHeight = useGroundHeight(lng, lat)

  if (isHidden) return null

  if (
    !deviceStatusFilter(
      { status: onlineStatus, taskStatus },
      isOnline,
      isTask,
      isNotTask,
    )
  ) {
    return null
  }

  const position = Cesium.Cartesian3.fromDegrees(lng, lat, groundHeight)

  return (
    <>
      <Billboard
        key={deviceId}
        id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}`}
        position={position}
        image={icon}
        width={26}
        height={26}
        disableDepthTestDistance={16_000_000}
      />
      <DeviceLabel text={data.deviceName} id={deviceId} position={position} />
      <DeviceOverlays deviceId={deviceId} />
    </>
  )
})

UavAirportMarker.displayName = 'UavAirportMarker'

export default UavAirportMarker
