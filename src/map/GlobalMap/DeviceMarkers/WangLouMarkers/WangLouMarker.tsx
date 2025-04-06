import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
// import wanglou from '@/assets/marker/wanglou.png'
import wanglou from '/images/marker/icon/wanglou.svg'
import DeviceLabel from '@/components/map/device/DeviceLabel'

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

  const lng = realLon || data.longitude
  const lat = realLat || data.latitude

  const isOnline = useDeviceListConfigStore((s) => s.isOnline)
  const isHidden = useDeviceListConfigStore((s) => s.hiddenDeviceIds[deviceId])

  const status = useRealOnlineStatus(deviceId)

  if (isHidden) return null

  if (isOnline && status !== DeviceStatusEnum.ONLINE) return null

  return (
    <>
      <Billboard
        key={deviceId}
        id={`device--${deviceType}--${data.deviceName}--${deviceId}--${lng}--${lat}`}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        image={wanglou}
        width={26}
        height={26}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
      />
      <DeviceLabel
        text={data.deviceName}
        id={deviceId}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
      />
    </>
  )
})

WangLouMarker.displayName = 'WangLouMarker'

export default WangLouMarker
