import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import HistoryTrack from '@/components/map/HistoryTrack'
import useRealTrack3D from '@/hooks/device/useRealTrack3D'
import useDeviceTrackColorStore from '@/store/setting/useDeviceTrackColor.store'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = unknown

/**
 * 实时轨迹
 */
const UavRealTrack: FC<PropsType> = memo(() => {
  const lon = useUavControlRoomStore((s) => s.state.longitude)
  const lat = useUavControlRoomStore((s) => s.state.latitude)
  const altitude = useUavControlRoomStore((s) => s.state.altitude)
  const { historyTrack, realTrack } = useRealTrack3D(lon, lat, altitude)

  const deivceId = useDeviceDetailStore((s) => s.deviceId)
  const color = useDeviceTrackColorStore(
    (s) => s.colorMap[deivceId] || '#d42422',
  )
  const materialType = useDeviceTrackColorStore(
    (s) => s.materialType[deivceId] || 'glow',
  )

  return (
    <>
      {historyTrack.map((track, index) => (
        <HistoryTrack
          key={index}
          value={track}
          color={color}
          materialType={materialType}
        />
      ))}
      {realTrack.length > 1 && (
        <HistoryTrack
          value={realTrack}
          color={color}
          materialType={materialType}
        />
      )}
    </>
  )
})

UavRealTrack.displayName = 'UavRealTrack'

export default UavRealTrack
