import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import icon from '/images/marker/icon/uav3.svg'
import { Billboard, Label } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const UavMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data

  const realLon = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.longitude,
  )
  const realLat = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.latitude,
  )
  const realHeading = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.uavYaw,
  )

  const lng = realLon || data.longitude
  const lat = realLat || data.latitude

  const isOnline = useDeviceListConfigStore((s) => s.isOnline)
  const isTask = useDeviceListConfigStore((s) => s.isTask)
  const isNotTask = useDeviceListConfigStore((s) => s.isNotTask)
  const isHidden = useDeviceListConfigStore((s) => s.hiddenDeviceIds[deviceId])

  const status = useRealOnlineStatus(deviceId)

  const rightMode = useRightMode((s) => s.rightMode)
  const detailDeviceId = useRightMode((s) => s.detailId)

  if (isHidden) return null
  if (
    !deviceStatusFilter(
      { status, taskStatus: 'RUNNING' },
      isOnline,
      isTask,
      isNotTask,
    )
  ) {
    return null
  }
  if (isOnline && status !== DeviceStatusEnum.ONLINE) return null
  if (rightMode === RightModeEnum.DEVICE && detailDeviceId === deviceId)
    return null

  return (
    <>
      <Billboard
        key={deviceId}
        id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}`}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        image={icon}
        width={26}
        height={26}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
        rotation={Cesium.Math.toRadians(realHeading || 0)}
      />
      <Label
        key={deviceId + '-label'}
        id={deviceId + '-label'}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        scale={0.1}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        text={data.deviceName}
        outlineColor={Cesium.Color.fromCssColorString('#000')}
        outlineWidth={5}
        font="700 128px Helvetica"
        pixelOffset={new Cesium.Cartesian2(0, 32)}
        backgroundColor={Cesium.Color.BLACK}
        fillColor={Cesium.Color.WHITE}
        backgroundPadding={new Cesium.Cartesian2(5, 5)}
        disableDepthTestDistance={50000}
        style={Cesium.LabelStyle.FILL_AND_OUTLINE}
        heightReference={Cesium.HeightReference.NONE}
        distanceDisplayCondition={
          new Cesium.DistanceDisplayCondition(0, 500_000)
        }
      />
    </>
  )
})

UavMarker.displayName = 'UavMarker'

export default UavMarker
