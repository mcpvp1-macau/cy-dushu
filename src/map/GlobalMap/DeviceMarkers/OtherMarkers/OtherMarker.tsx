import useGlobalWsStore, {
  useRealOnlineStatus,
  useRealTaskStatus,
} from '@/store/useGlobalWebSocket.store'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import useDeviceFilterConfigStore from '@/store/useDeviceFilterConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import uav from '/images/marker/icon/uav.png'
import jiku from '@/assets/marker/wurenjiku.svg'
import jiqigou from '@/assets/marker/jiqigou.png'
import TTP from '@/assets/marker/TTP.png'
import ren from '@/assets/marker/ren.png'
// import wanglou from 'images/marker/wanglou.png'
import car from '/images/marker/icon/car.svg'
import wanglou from '/images/marker/icon/wanglou.svg'
import GroundPolygonCircle from '@/components/map/GroundPolygonCircle'
import VideoFrustum from './VideoFrustum'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import useGroundHeight from '@/hooks/cesium/useGroundHeight'
import Radar from '../WangLouMarkers/Radar'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import DeviceMarkerRipple from '../components/DeviceMarkerRipple'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = {
  data: API_DEVICE.domain.Device
}

export const deviceIconMap: any = {
  UAV: uav,
  UAV_AIRPORT: jiku,
  ROBOT_DOG: jiqigou,
  TTP_BOX: TTP,
  CAMERA: '/images/marker/icon/camera.svg',
  SITE_ENFORCEMENT_RECORDER: '/images/marker/icon/zhifayi.svg',
  PERSON: ren,
  WANGLOU: wanglou,
  CAR: car,
  RADAR: '/images/marker/icon/radar.svg',

  THEODOLITE: '/images/marker/icon/theodolite.svg',
  ES_EF_CAR: '/images/marker/icon/es_ef_car.svg',
  LASER_WEAPON: '/images/marker/icon/laser_weapon2.svg',
  SHELL: '/images/marker/icon/shell.svg',
  MC: '/images/marker/icon/mc.svg',
  UGV: '/images/marker/icon/ugv.svg',
  'DUSHU-MB': '/images/marker/icon/ren.svg',
}

const OtherMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId, deviceType, properties } = data

  const isFlashing = useMapDevicesStore((s) => s.deviceFlashes[deviceId])

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

  const isOnline = useDeviceFilterConfigStore((s) => s.isOnline)
  const isHidden = useDeviceFilterConfigStore(
    (s) => s.hiddenDeviceIds[deviceId],
  )

  const status = useRealOnlineStatus(deviceId)
  const taskStatus = useRealTaskStatus(deviceId)

  const isTask = useDeviceFilterConfigStore((s) => s.isTask)
  const isNotTask = useDeviceFilterConfigStore((s) => s.isNotTask)

  if (
    isHidden || // 隐藏
    !deviceStatusFilter({ status, taskStatus }, isOnline, isTask, isNotTask)
  ) {
    return null
  }

  const position = Cesium.Cartesian3.fromDegrees(
    lng,
    lat,
    altitude || groundHeight,
  )

  return (
    <>
      {isFlashing && (
        <DeviceMarkerRipple
          position={[lng, lat, altitude ?? groundHeight]}
        />
      )}
      <Billboard
        key={deviceId}
        id={`device--${deviceType}--${data.deviceName}--${deviceId}--${lng}--${lat}`}
        position={position}
        image={deviceIconMap[deviceType]}
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
          {status === DeviceStatusEnum.ONLINE && (
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
