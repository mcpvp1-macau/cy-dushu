import HistoryTrack from '@/components/map/HistoryTrack'
import useRealTrack from '@/hooks/device/useRealTrack'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import useDeviceTrackColorStore from '@/store/setting/useDeviceTrackColor.store'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'

type PropsType = unknown

/**
 * 实时轨迹
 */
const UsvRealTrack: FC<PropsType> = memo(() => {
  const lon = useUsvControlRoomStore((s) => s.state.longitude)
  const lat = useUsvControlRoomStore((s) => s.state.latitude)
  const { historyTrack, realTrack } = useRealTrack(lon, lat)

  const deviceId = useDeviceDetailStore((s) => s.deviceId) || ''
  const color = useDeviceTrackColorStore(
    (s) => s.colorMap[deviceId] || '#d42422',
  )
  const materialType = useDeviceTrackColorStore(
    (s) => s.materialType[deviceId] || 'glow',
  )

  return (
    <>
      {/* 业务规则：无人船轨迹需要贴地展示 */}
      {historyTrack.map((track, index) => (
        <HistoryTrack
          key={index}
          value={track}
          color={color}
          materialType={materialType}
          clampToGround
        />
      ))}
      {realTrack.length > 1 && (
        <HistoryTrack
          value={realTrack}
          color={color}
          materialType={materialType}
          clampToGround
        />
      )}
    </>
  )
})

UsvRealTrack.displayName = 'UsvRealTrack'

export default UsvRealTrack
