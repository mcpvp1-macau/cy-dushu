import icon from '/images/marker/icon/uav_dock.svg'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import DeviceLabel from '@/components/map/device/DeviceLabel'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const UavAirportMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data

  // 机库刷新经纬度频率很低，所以这里不用获取实时数据了~
  const lng = data.longitude
  const lat = data.latitude

  const onlineStatus = useRealOnlineStatus(deviceId)

  const isOnline = useDeviceListConfigStore((s) => s.isOnline)
  const isTask = useDeviceListConfigStore((s) => s.isTask)
  const isNotTask = useDeviceListConfigStore((s) => s.isNotTask)
  const isHidden = useDeviceListConfigStore((s) => s.hiddenDeviceIds[deviceId])

  if (isHidden) return null

  if (
    !deviceStatusFilter(
      { status: onlineStatus, taskStatus: 'RUNNING' },
      isOnline,
      isTask,
      isNotTask,
    )
  ) {
    return null
  }

  return (
    <>
      <Billboard
        key={deviceId}
        id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}`}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        image={icon}
        width={26}
        height={26}
        disableDepthTestDistance={16_000_000}
        heightReference={Cesium.HeightReference.NONE}
      />
      <DeviceLabel
        text={data.deviceName}
        id={deviceId}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
      />
    </>
  )
})

UavAirportMarker.displayName = 'UavAirportMarker'

export default UavAirportMarker
