import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import wanglou from '/images/marker/icon/wanglou.svg'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import useGroundHeight from '@/hooks/cesium/useGroundHeight'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const WangLouMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId, deviceType } = data

  const realLon = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.longitude,
  )
  const realLat = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.latitude,
  )

  const lng = realLon || data.longitude || 0
  const lat = realLat || data.latitude || 0

  const isOnline = useDeviceListConfigStore((s) => s.isOnline)
  const isHidden = useDeviceListConfigStore((s) => s.hiddenDeviceIds[deviceId])

  const status = useRealOnlineStatus(deviceId)

  const groundHeight = useGroundHeight(lng, lat)

  if (isHidden) return null

  if (isOnline && status !== DeviceStatusEnum.ONLINE) return null

  const position = Cesium.Cartesian3.fromDegrees(lng, lat, groundHeight)

  return (
    <>
      <Billboard
        key={deviceId}
        id={`device--${deviceType}--${data.deviceName}--${deviceId}--${lng}--${lat}`}
        position={position}
        image={wanglou}
        width={26}
        height={26}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
      />
      <DeviceLabel
        text={data.deviceName}
        id={deviceId}
        position={position}
        heightReference={Cesium.HeightReference.NONE}
      />
    </>
  )
})

WangLouMarker.displayName = 'WangLouMarker'

export default WangLouMarker
