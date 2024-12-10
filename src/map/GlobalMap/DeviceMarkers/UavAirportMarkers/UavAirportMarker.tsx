import icon from '@/assets/marker/icon/uav_dock.svg'
import { Billboard, Label } from 'resium'
import * as Cesium from 'cesium'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'

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
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
      />
      <Label
        key={deviceId + '-label'}
        id={deviceId + '-label'}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        scale={0.2}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        text={data.deviceName}
        outlineColor={Cesium.Color.fromCssColorString('#000')}
        outlineWidth={5}
        font="700 64px Helvetica"
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

UavAirportMarker.displayName = 'UavAirportMarker'

export default UavAirportMarker
