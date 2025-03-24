import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import icon from '/images/marker/icon/uav3.svg'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import HeightDashLine from '@/map/CesiumMap/components/service/common/HeightDashLine'

type PropsType = {
  data: API_DEVICE.domain.Device
}

/** 无人机图标 */
const UavMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data

  const properties = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties,
  )

  const realLon = properties?.longitude
  const realLat = properties?.latitude
  const realHeading = properties?.uavYaw
  const realAlt = properties?.altitude

  const lng = realLon || data.longitude
  const lat = realLat || data.latitude

  const isOnline = useDeviceListConfigStore((s) => s.isOnline)
  const isTask = useDeviceListConfigStore((s) => s.isTask)
  const isNotTask = useDeviceListConfigStore((s) => s.isNotTask)
  const isHidden = useDeviceListConfigStore((s) => s.hiddenDeviceIds[deviceId])

  const status = useRealOnlineStatus(deviceId)

  const rightMode = useRightMode((s) => s.rightMode)
  const detailDeviceId = useRightMode((s) => s.detailId)

  if (
    isHidden || // 隐藏
    (isOnline && status !== DeviceStatusEnum.ONLINE) || // 在线状态不显示
    !deviceStatusFilter(
      { status, taskStatus: 'RUNNING' },
      isOnline,
      isTask,
      isNotTask,
    ) || // 任务状态不显示（对应设备树中的筛选）
    (rightMode === RightModeEnum.DEVICE && detailDeviceId === deviceId) // 设备详情模式下不显示
  ) {
    return null
  }

  return (
    <>
      <Billboard
        id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}`}
        position={Cesium.Cartesian3.fromDegrees(
          lng || 120,
          lat || 30,
          realAlt || 0,
        )}
        image={icon}
        width={28}
        height={28}
        disableDepthTestDistance={16_000_000}
        heightReference={Cesium.HeightReference.NONE}
        rotation={Cesium.Math.toRadians(-realHeading || 0)}
      />
      <DeviceLabel
        text={data.deviceName}
        id={deviceId}
        position={Cesium.Cartesian3.fromDegrees(
          lng || 120,
          lat || 30,
          realAlt || 0,
        )}
      />
      <HeightDashLine
        position={[lng || 120, lat || 30, realAlt || 0]}
        color="#fff"
      />
    </>
  )
})

UavMarker.displayName = 'UavMarker'

export default UavMarker
