import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import icon from '/images/marker/icon/rebot_dog.svg'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import directionIcon from '/images/marker/icon/rebot_dog_direction.svg'

type PropsType = {
  data: API_DEVICE.domain.Device
}

/** 机器狗图标 */
const RebotDogMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data

  const realLon = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.longitude,
  )
  const realLat = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.latitude,
  )
  const realHeading =
    useGlobalWsStore(
      (s) =>
        s.deviceRealtimeProperties[data.deviceId]?.properties?.headingAngle ??
        0,
    ) * -1

  const lng = realLon || data.longitude
  const lat = realLat || data.latitude

  const isOnline = useDeviceListConfigStore((s) => s.isOnline)
  const isTask = useDeviceListConfigStore((s) => s.isTask)
  const isNotTask = useDeviceListConfigStore((s) => s.isNotTask)
  const isHidden = useDeviceListConfigStore((s) => s.hiddenDeviceIds[deviceId])

  const status = useRealOnlineStatus(deviceId)

  if (
    isHidden || // 隐藏
    (isOnline && status !== DeviceStatusEnum.ONLINE) || // 在线状态不显示
    !deviceStatusFilter(
      { status, taskStatus: 'RUNNING' },
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
        width={25}
        height={25}
        disableDepthTestDistance={16_000_000}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        rotation={Cesium.Math.toRadians(-realHeading || 0)}
      />
      <Billboard
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        image={directionIcon}
        width={13}
        height={13}
        disableDepthTestDistance={16_000_000}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        rotation={Cesium.Math.toRadians(realHeading)}
        pixelOffset={
          new Cesium.Cartesian2(
            -13 * Math.sin(Cesium.Math.toRadians(realHeading)),
            -13 * Math.cos(Cesium.Math.toRadians(realHeading)),
          )
        }
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

RebotDogMarker.displayName = 'UavMarker'

export default RebotDogMarker
