import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useLatest } from 'ahooks'
import { isNil } from 'lodash'
import * as turf from '@turf/turf'
import HistoryTrack from '@/components/map/HistoryTrack'

type PropsType = unknown

type Track = { lon: number; lat: number }[]

const GROUP_NUMBER = 64

/**
 * 实时轨迹
 */
const UavRealTrack: FC<PropsType> = memo(() => {
  const lon = useUavControlRoomStore((s) => s.state.longitude)
  const lat = useUavControlRoomStore((s) => s.state.latitude)

  const [realTrack, setRealTrack] = useState<Track>([])
  // 当实时轨迹到达 GROUP_NUMBER 时, 将实时轨迹添加到历史轨迹中, 历史轨迹不会每帧都计算
  const [historyTrack, setHistoryTrack] = useState<Track[]>([])
  const realTrackLastest = useLatest(realTrack)
  const historyTrackLatest = useLatest(historyTrack)

  useEffect(() => {
    if (isNil(lon) || isNil(lat)) {
      return
    }
    if (realTrackLastest.current.length === 0) {
      setRealTrack([{ lon: lon, lat }])
      return
    }
    const last = realTrackLastest.current.at(-1)!
    let track = realTrackLastest.current
    // 判断距离
    if (Math.abs(last.lon - lon) < 1e-5 && Math.abs(last.lat - lat) < 1e-5) {
      return
    }
    // 判断角度
    if (
      track.length > 1 &&
      Math.abs(
        turf.bearing(turf.point([lon, lat]), turf.point([last.lon, last.lat])) -
          turf.bearing(
            turf.point([last.lon, last.lat]),
            turf.point([track.at(-2)!.lon, track.at(-2)!.lat]),
          ),
      ) < 1e-2
    ) {
      track = track.slice(0, -1)
    }
    // 将轨迹添加到历史轨迹中
    if (track.length === GROUP_NUMBER) {
      setHistoryTrack([...historyTrackLatest.current, track])
    }
    // 留 1 次, 防止在切换的过程中闪一下, 所以没有写在上面的 if 中
    if (track.length > GROUP_NUMBER) {
      track = [historyTrackLatest.current.at(-1)!.at(-1)!]
    }
    setRealTrack([...track, { lon: lon, lat }])
  }, [lon, lat, realTrackLastest])

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
