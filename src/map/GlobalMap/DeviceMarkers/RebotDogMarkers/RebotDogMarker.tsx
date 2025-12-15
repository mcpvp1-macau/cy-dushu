import useGlobalWsStore, {
  useRealOnlineStatus,
  useRealTaskStatus,
} from '@/store/useGlobalWebSocket.store'
import icon from '/images/marker/icon/rebot_dog.svg'
import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import useDeviceFilterConfigStore from '@/store/useDeviceFilterConfig.store'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import directionIcon from '/images/marker/icon/rebot_dog_direction.svg'
import useGroundHeight from '@/hooks/cesium/useGroundHeight'
import DeviceMarkerRipple from '../components/DeviceMarkerRipple'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import useRealTrack3D from '@/hooks/device/useRealTrack3D'
import useDeviceTrackColorStore from '@/store/setting/useDeviceTrackColor.store'
import { isNil } from 'lodash'
import DeviceTrackRenderer from '../components/DeviceTrackRenderer'

type PropsType = {
  data: API_DEVICE.domain.Device
}

/** 机器狗图标 */
const RebotDogMarker: FC<PropsType> = memo(({ data }) => {
  const { deviceId } = data

  const isFlashing = useMapDevicesStore((s) => s.deviceFlashes[deviceId])

  const { commonLongitude, commonLatitude } = useMapDevicesStore((s) => {
    const state = s.commonStates[deviceId]
    return {
      commonLongitude: state?.longitude,
      commonLatitude: state?.latitude,
    }
  })

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

  const lng = realLon || data.longitude || 0
  const lat = realLat || data.latitude || 0

  const groundHeight = useGroundHeight(lng, lat)

  const trackAltitude = 0
  const enableTrack = !isNil(commonLongitude) && !isNil(commonLatitude)

  const { historyTrack, realTrack, clear } = useRealTrack3D(
    enableTrack ? commonLongitude : undefined,
    enableTrack ? commonLatitude : undefined,
    enableTrack ? trackAltitude : undefined,
  )

  useEffect(() => {
    clear(true)
  }, [deviceId])

  const isOnline = useDeviceFilterConfigStore((s) => s.isOnline)
  const isTask = useDeviceFilterConfigStore((s) => s.isTask)
  const isNotTask = useDeviceFilterConfigStore((s) => s.isNotTask)
  const isHidden = useDeviceFilterConfigStore(
    (s) => s.hiddenDeviceIds[deviceId],
  )

  const status = useRealOnlineStatus(deviceId)
  const taskStatus = useRealTaskStatus(deviceId)

  const color = useDeviceTrackColorStore(
    (s) => s.colorMap[deviceId] || '#d42422',
  )
  const materialType = useDeviceTrackColorStore(
    (s) => s.materialType[deviceId] || 'glow',
  )

  if (
    isHidden || // 隐藏
    !deviceStatusFilter({ status, taskStatus }, isOnline, isTask, isNotTask)
  ) {
    return null
  }

  const position = Cesium.Cartesian3.fromDegrees(lng, lat, groundHeight)

  return (
    <>
      {isFlashing && <DeviceMarkerRipple position={[lng, lat, groundHeight]} />}
      <Billboard
        key={deviceId}
        id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}`}
        position={position}
        image={icon}
        width={25}
        height={25}
        disableDepthTestDistance={16_000_000}
        heightReference={Cesium.HeightReference.NONE}
        rotation={Cesium.Math.toRadians(-realHeading || 0)}
      />
      <Billboard
        position={position}
        image={directionIcon}
        width={13}
        height={13}
        disableDepthTestDistance={16_000_000}
        heightReference={Cesium.HeightReference.NONE}
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
        position={position}
        heightReference={Cesium.HeightReference.NONE}
      />
      <DeviceTrackRenderer
        enableTrack={enableTrack}
        historyTrack={historyTrack}
        realTrack={realTrack}
        color={color}
        materialType={materialType}
        clampToGround
      />
    </>
  )
})

RebotDogMarker.displayName = 'UavMarker'

export default RebotDogMarker
