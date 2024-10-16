import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import HistoryTrack from '@/components/map/HistoryTrack'
import useRealTrack from '@/hooks/device/useRealTrack'

type PropsType = unknown

/**
 * 实时轨迹
 */
const UavRealTrack: FC<PropsType> = memo(() => {
  const lon = useUavControlRoomStore((s) => s.state.longitude)
  const lat = useUavControlRoomStore((s) => s.state.latitude)

  const { historyTrack, realTrack } = useRealTrack(lon, lat)

  return (
    <>
      {historyTrack.map((track, index) => (
        <HistoryTrack key={index} value={track} />
      ))}
      {realTrack.length > 1 && <HistoryTrack value={realTrack} useCallback />}
    </>
  )
})

UavRealTrack.displayName = 'UavRealTrack'

export default UavRealTrack
