import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import uav from '/images/marker/icon/uav.png'
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
import useGroundHeight from '@/hooks/cesium/useGroundHeight'
import Radar from '../WangLouMarkers/Radar'

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
  RADAR: '/images/marker/icon/radar.svg',

  THEODOLITE: '/images/marker/icon/theodolite.svg',
  ES_EF_CAR: '/images/marker/icon/es_ef_car.svg',
  LASER_WEAPON: '/images/marker/icon/laser_weapon2.svg',
  SHELL: '/images/marker/icon/shell.svg',
  MC: '/images/marker/icon/mc.svg',
}

const OtherMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId, deviceType, properties } = data

  const realLon = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.longitude,
  )
  const realLat = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.latitude,
  )

  const realAltitude = useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[data.deviceId]?.properties?.altitude,
  )

  const lng = realLon || data.longitude || 0
  const lat = realLat || data.latitude || 0
  const altitude = realAltitude || data.altitude || 0

  const groundHeight = useGroundHeight(lng, lat)

  const isOnline = useDeviceListConfigStore((s) => s.isOnline)
  const isHidden = useDeviceListConfigStore((s) => s.hiddenDeviceIds[deviceId])

  const status = useRealOnlineStatus(deviceId)

  if (isHidden) return null

  const isDeviceOnline = isOnline && status === DeviceStatusEnum.ONLINE

  if (isOnline && !isDeviceOnline) return null

  const position = Cesium.Cartesian3.fromDegrees(
    lng,
    lat,
    altitude || groundHeight,
  )

  return (
    <>
      <Billboard
        key={deviceId}
        id={`device--${deviceType}--${data.deviceName}--${deviceId}--${lng}--${lat}`}
        position={position}
        image={deviceIconMap[deviceType] || camera}
        width={24}
        height={24}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
      />
      <DeviceLabel
        text={data.deviceName}
        id={deviceId}
        position={position}
        heightReference={Cesium.HeightReference.NONE}
      />
      {deviceType === 'RADAR' && properties.scope ? (
        <>
          {isDeviceOnline && (
            <GroundPolygonCircle lng={lng} lat={lat} scope={properties.scope} />
          )}
        </>
      ) : null}

      {deviceType === 'RADAR' && properties?.scanRangeProfile ? (
        <>
          <Radar scanRangeProfile={properties?.scanRangeProfile} />
        </>
      ) : null}
      {properties?.videoList?.length ? <VideoFrustum data={data} /> : null}
    </>
  )
})

OtherMarker.displayName = 'OtherMarker'

export default OtherMarker
