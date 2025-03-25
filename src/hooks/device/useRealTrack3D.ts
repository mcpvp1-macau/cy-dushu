import { useLatest } from 'ahooks'
import { isNil } from 'lodash'
import { isSame, isLine } from '@/utils/path'

type Track = { lng: number; lat: number; alt: number }[]

const GROUP_NUMBER = 64

/** 通过更新经度和维度, 实时收集点位, 并缓存分组 */
const useRealTrack3D = (lng?: number, lat?: number, alt?: number) => {
  const [realTrack, setRealTrack] = useState<Track>([])
  // 当实时轨迹到达 GROUP_NUMBER 时, 将实时轨迹添加到历史轨迹中, 历史轨迹不会每帧都计算
  const [historyTrack, setHistoryTrack] = useState<Track[]>([])
  const realTrackLastest = useLatest(realTrack)
  const historyTrackLatest = useLatest(historyTrack)

  useEffect(() => {
    if (isNil(lng) || isNil(lat) || isNil(alt)) {
      return
    }
    if (lng === 0 && lat === 0) {
      return
    }
    if (realTrackLastest.current.length === 0) {
      setRealTrack([{ lng, lat, alt }])
      return
    }
    const last = realTrackLastest.current.at(-1)!
    let track = realTrackLastest.current
    // 判断距离
    if (isSame([lng, lat, alt], [last.lng, last.lat, last.alt], 1e-5)) {
      return
    }

    // 判断角度
    // 判断三点是否在一条直线上，如果是，则移除中间点
    if (track.length > 1) {
      const p1 = [track.at(-2)!.lng, track.at(-2)!.lat, track.at(-2)!.alt]
      const p2 = [last.lng, last.lat, last.alt]
      const p3 = [lng, lat, alt]
      if (isLine(p1, p2, p3)) {
        track = track.slice(0, -1)
      }
    }

    // 将轨迹添加到历史轨迹中
    if (track.length === GROUP_NUMBER) {
      setHistoryTrack([...historyTrackLatest.current, track])
    }
    // 留 1 次, 防止在切换的过程中闪一下, 所以没有写在上面的 if 中
    if (track.length > GROUP_NUMBER) {
      track = [historyTrackLatest.current.at(-1)!.at(-1)!]
    }
    setRealTrack([...track, { lng, lat, alt }])
  }, [lng, lat, realTrackLastest])

  const clear = (saveCurrent = false) => {
    setRealTrack(
      saveCurrent && !isNil(lng) && !isNil(lat) && !isNil(alt)
        ? [{ lng, lat, alt }]
        : [],
    )
    setHistoryTrack([])
  }

  return { realTrack, historyTrack, clear }
}

export default useRealTrack3D
