import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import { Billboard, Label } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
// import wanglou from '@/assets/marker/wanglou.png'
import wanglou from '/images/marker/icon/wanglou.svg'

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
  console.info('望楼--',deviceId)

  if (isHidden) return null

  if (isOnline && status !== DeviceStatusEnum.ONLINE) return null

  console.info('望楼-222-',deviceId)

  return (
    <>
      <Billboard
        key={deviceId}
        id={`device--${deviceType}--${data.deviceName}--${deviceId}--${lng}--${lat}`}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        image={wanglou}
        width={26}
        height={26}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
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
        pixelOffset={new Cesium.Cartesian2(0, 25)}
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

WangLouMarker.displayName = 'WangLouMarker'

export default WangLouMarker
