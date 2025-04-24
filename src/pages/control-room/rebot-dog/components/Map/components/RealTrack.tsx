import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import HistoryTrack from '@/components/map/HistoryTrack'
import useRealTrack from '@/hooks/device/useRealTrack'

type PropsType = unknown

/**
 * 实时轨迹
 */
const RebotDogRealTrack: FC<PropsType> = memo(() => {
  const lon = useRebotDogControlRoomStore((s) => s.state.longitude)
  const lat = useRebotDogControlRoomStore((s) => s.state.latitude)

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

RebotDogRealTrack.displayName = 'RebotDogRealTrack'

export default RebotDogRealTrack
