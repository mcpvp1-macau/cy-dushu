import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import { Billboard, Label } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import uav from '/images/marker/icon/uav.svg'
import jiku from '@/assets/marker/wurenjiku.svg'
import jiqigou from '@/assets/marker/jiqigou.png'
import TTP from '@/assets/marker/TTP.png'
import camera from '/images/marker/icon/camera.svg'
import zhifayi from '/images/marker/icon/zhifayi.svg'
import ren from '@/assets/marker/ren.png'
// import wanglou from 'images/marker/wanglou.png'
import car from '/images/marker/icon/car.svg'
import wanglou from '/images/marker/icon/wanglou.svg'
import radar from '/images/marker/icon/radar.svg'
import GroundPolygonCircle from '@/components/map/GroundPolygonCircle'
import VideoFrustum from './VideoFrustum'

type PropsType = {
  data: API_DEVICE.domain.Device
}

const deviceIconMap: any = {
  UAV: uav,
  UAV_AIRPORT: jiku,
  ROBOT_DOG: jiqigou,
  TTP_BOX: TTP,
  CAMERA: camera,
  SITE_ENFORCEMENT_RECORDER: zhifayi,
  PERSON: ren,
  WANGLOU: wanglou,
  CAR: car,
  RADAR: radar,
}

const OtherMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId, deviceType, properties } = data

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
  // if (
  //   !deviceStatusFilter(
  //     { status, taskStatus: 'RUNNING' },
  //     isOnline,
  //     isTask,
  //     isNotTask,
  //   )
  // ) {
  //   return null
  // }
  if (isOnline && status !== DeviceStatusEnum.ONLINE) return null

  return (
    <>
      <Billboard
        key={deviceId}
        id={`device--${deviceType}--${data.deviceName}--${deviceId}--${lng}--${lat}`}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        image={deviceIconMap[deviceType] || camera}
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
      {deviceType === 'RADAR' && properties.scope ? (
        <>
          <GroundPolygonCircle lng={lng} lat={lat} scope={properties.scope} />
        </>
      ) : null}
      {properties?.videoList?.length ? <VideoFrustum data={data} /> : null}
    </>
  )
})

OtherMarker.displayName = 'OtherMarker'

export default OtherMarker
