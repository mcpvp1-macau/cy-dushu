import useGlobalWsStore, {
  useRealOnlineStatus,
} from '@/store/useGlobalWebSocket.store'
import { Billboard, useCesium } from 'resium'
import * as Cesium from 'cesium'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import { DeviceStatusEnum } from '@/enum/device'
import { deviceStatusFilter } from '@/pages/situation/source/utils'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import HeightDashLine from '@/map/CesiumMap/components/service/common/HeightDashLine'
import { useShallow } from 'zustand/react/shallow'
import { round } from 'lodash'
import { useAsyncEffect } from 'ahooks'
import GLBModel from '@/map/CesiumMap/components/service/common/GLBModel'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import HistoryTrack from '@/components/map/HistoryTrack'
import useDeviceTrackColorStore from '@/store/setting/useDeviceTrackColor.store'
import DeviceOverlays from '../components/DeviceOverlays'

type PropsType = {
  data: API_DEVICE.domain.Device
  onPositionChange?: (postion: {
    longitude: number
    latitude: number
    altitude: number
  }) => void
}

/** 无人机图标 */
const UavMarker: FC<PropsType> = memo(({ data, onPositionChange }) => {
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

  // 地面位置
  const [groundHeight, setGroundHeight] = useState(0)

  useAsyncEffect(async () => {
    if (!viewer) {
      return
    }
    const position = Cesium.Cartographic.fromDegrees(lng || 120, lat || 30)
    const res = await Cesium.sampleTerrain(viewer.terrainProvider, 11, [
      position,
    ])
    const h = res[0]?.height ?? 0
    if (Math.abs(h - groundHeight) > 0.1) {
      setGroundHeight(h)
    }
  }, [lng, lat, deviceIsOnline])

  const alt = deviceIsOnline
    ? Math.max(groundHeight, realAlt ?? 0)
    : groundHeight

  useEffect(() => {
    onPositionChange?.({
      longitude: lng ?? 0,
      latitude: lat ?? 0,
      altitude: alt,
    })
  }, [lng, lat, alt, onPositionChange])

  const isSTRIKER = useMemo(
    () =>
      data.deviceTags.find(
        (e) => e.tagName === 'BUSINESS_TYPE' && e.tagValue === 'STRIKER',
      ),
    [data.deviceTags],
  )

  const inActiveTracks = useMapDevicesStore(
    (s) => s.deviceInActiveTracks[deviceId],
  )

  const color = useDeviceTrackColorStore(
    (s) => s.colorMap[deviceId] || '#d42422',
  )
  const materialType = useDeviceTrackColorStore(
    (s) => s.materialType[deviceId] || 'glow',
  )

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

  const position = Cesium.Cartesian3.fromDegrees(lng || 120, lat || 30, alt)

  return (
    <>
      {data.deviceName?.includes('BZK') ? (
        <GLBModel
          id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}`}
          modelUrl="/ja-map/models/CY5E1.glb"
          position={position}
          heading={Cesium.Math.toRadians((realHeading || 0) + 180)}
          pitch={Cesium.Math.toRadians(90)}
          scale={2}
        />
      ) : (
        <Billboard
          id={`device--${data.deviceType}--${data.deviceName}--${data.deviceId}--${lng}--${lat}`}
          position={position}
          image={
            isSTRIKER
              ? '/images/marker/icon/dajiUav.svg'
              : '/images/marker/icon/uav3.svg'
          }
          width={28}
          height={28}
          disableDepthTestDistance={16_000_000}
          heightReference={Cesium.HeightReference.NONE}
          rotation={Cesium.Math.toRadians(-realHeading || 0)}
        />
      )}
      <DeviceLabel
        text={data.deviceName}
        id={deviceId}
        position={position}
        heightReference={Cesium.HeightReference.NONE}
      />
      {deviceIsOnline && alt !== groundHeight && (
        <HeightDashLine position={[lng || 120, lat || 30, alt]} color="#fff" />
      )}
      {inActiveTracks?.length > 0 &&
        inActiveTracks.map((track, index) => (
          <HistoryTrack
            key={index}
            value={track}
            color={color}
            materialType={materialType}
          />
        ))}
      <DeviceOverlays deviceId={deviceId} />
    </>
  )
})

UavMarker.displayName = 'UavMarker'

export default UavMarker
