import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import { Billboard } from 'resium'
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
import DeviceLabel from '@/components/map/device/DeviceLabel'

type PropsType = {
  data: API_DEVICE.domain.Device
}

export const deviceIconMap: any = {
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
        width={24}
        height={24}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
      />
      <DeviceLabel
        text={data.deviceName}
        id={deviceId}
        position={Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30)}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
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
