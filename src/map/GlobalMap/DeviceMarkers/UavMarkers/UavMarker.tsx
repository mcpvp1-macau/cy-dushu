import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import icon from '/images/marker/icon/uav3.svg'
import { Billboard, useCesium } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import HeightDashLine from '@/map/CesiumMap/components/service/common/HeightDashLine'
import { useShallow } from 'zustand/react/shallow'
import { round } from 'lodash'

type PropsType = {
  data: API_DEVICE.domain.Device
}

/** 无人机图标 */
const UavMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data

  const { realLon, realLat, realHeading, realAlt } = useGlobalWsStore(
    useShallow((s) => {
      const p = s.deviceRealtimeProperties[data.deviceId]?.properties
      return {
        realLon: round(p?.longitude ?? 0, 5),
        realLat: round(p?.latitude ?? 0, 5),
        realHeading: round(p?.uavYaw ?? 0, 5),
        realAlt: round(p?.altitude ?? 0, 1),
      }
    }),
  )

  const lng = realLon || data.longitude
  const lat = realLat || data.latitude

  const isOnline = useDeviceListConfigStore((s) => s.isOnline)
  const isTask = useDeviceListConfigStore((s) => s.isTask)
  const isNotTask = useDeviceListConfigStore((s) => s.isNotTask)
  const isHidden = useDeviceListConfigStore((s) => s.hiddenDeviceIds[deviceId])

  const status = useRealOnlineStatus(deviceId)
  const deviceIsOnline = status === DeviceStatusEnum.ONLINE
  const { viewer } = useCesium()
  if (
    isHidden || // 隐藏
    (isOnline && !deviceIsOnline) || // 在线状态不显示
    !deviceStatusFilter(
      { status, taskStatus: 'RUNNING' },
      isOnline,
      isTask,
      isNotTask,
    )
  ) {
    return null
  }

  const globeHeight =
    viewer?.scene.globe.getHeight(
      Cesium.Cartographic.fromDegrees(lng || 120, lat || 30),
    ) ?? 0

  const alt = Math.max(globeHeight, realAlt ?? 0)

  const position = Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30, alt)

  return (
    <>
      <Billboard
        id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}`}
        position={position}
        image={icon}
        width={28}
        height={28}
        disableDepthTestDistance={16_000_000}
        heightReference={
          deviceIsOnline
            ? Cesium.HeightReference.NONE
            : Cesium.HeightReference.CLAMP_TO_GROUND
        }
        rotation={Cesium.Math.toRadians(-realHeading || 0)}
      />
      <DeviceLabel
        text={data.deviceName}
        id={deviceId}
        position={position}
        heightReference={
          deviceIsOnline
            ? Cesium.HeightReference.NONE
            : Cesium.HeightReference.CLAMP_TO_GROUND
        }
      />
      {deviceIsOnline && alt !== globeHeight && (
        <HeightDashLine position={[lng || 120, lat || 30, alt]} color="#fff" />
      )}
    </>
  )
})

UavMarker.displayName = 'UavMarker'

export default UavMarker
