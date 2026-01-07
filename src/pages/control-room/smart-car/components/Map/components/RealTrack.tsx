import HistoryTrack from '@/components/map/HistoryTrack'
import useRealTrack from '@/hooks/device/useRealTrack'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import useDeviceTrackColorStore from '@/store/setting/useDeviceTrackColor.store'
import { useSmartCarControlRoomStore } from '@/store/context-store/useSmartCarControlRoom.store'

type PropsType = unknown

/**
 * 实时轨迹
 */
const SmartCarRealTrack: FC<PropsType> = memo(() => {
  const lon = useSmartCarControlRoomStore((s) => s.state.longitude)
  const lat = useSmartCarControlRoomStore((s) => s.state.latitude)
  const { historyTrack, realTrack } = useRealTrack(lon, lat)

  const deviceId = useDeviceDetailStore((s) => s.deviceId) || ''
  const color = useDeviceTrackColorStore(
    (s) => s.colorMap[deviceId] || '#d42422',
  )
  const materialType = useDeviceTrackColorStore(
    (s) => s.materialType[deviceId] || 'glow',
  )

  const tracks = useMemo(() => {
    const mergedTracks = [...historyTrack]
    if (realTrack.length > 1) {
      mergedTracks.push(realTrack)
    }

    return mergedTracks
  }, [historyTrack, realTrack])

  return (
    <>
      {/* 业务规则：智慧警车轨迹需要贴地展示 */}
      {tracks.map((track, index) => {
        const start = track.at(0)
        const key = start ? `${start.lng}-${start.lat}-${index}` : `${index}`

        return (
          <HistoryTrack
            key={key}
            value={track}
            color={color}
            materialType={materialType}
            clampToGround
          />
        )
      })}
    </>
  )
})

SmartCarRealTrack.displayName = 'SmartCarRealTrack'

export default SmartCarRealTrack
