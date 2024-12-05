import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'

/** 收集实时轨迹 */
const useCollectHistoryPath = (groupLimit: number) => {
  const lon = useUavControlRoomStore((s) => s.state.longitude)
  const lat = useUavControlRoomStore((s) => s.state.latitude)
  const alt = useUavControlRoomStore((s) => s.state.altitude)

  const historyTracks = useUavControlRoomStore((s) => s.historyTracks)
  const updateHistoryTracks = useUavControlRoomStore(
    (s) => s.updateHistoryTracks,
  )

  useEffect(() => {
    if (isNil(lon) || isNil(lat) || isNil(alt)) {
      return
    }
    if (!lon || !lat) {
      return
    }
    const newTracks = [...historyTracks]
    // 分组
    if (newTracks.length === 0) {
      newTracks.push([])
    } else if (newTracks[newTracks.length - 1].length >= groupLimit) {
      const last = newTracks[newTracks.length - 1]
      newTracks.push([
        [
          last[last.length - 1][0],
          last[last.length - 1][1],
          last[last.length - 1][2],
        ],
      ])
    }

    // 如果最后一个分组为空，则添加第一个点
    if (newTracks[newTracks.length - 1].length === 0) {
      newTracks[newTracks.length - 1].push([lon, lat, alt])
      updateHistoryTracks(newTracks)
      return
    }

    // 比较最后一个点是否接近
    const lastPoint =
      newTracks[newTracks.length - 1][
        newTracks[newTracks.length - 1].length - 1
      ]
    if (
      Math.abs(lastPoint[0] - lon) < 1e-5 &&
      Math.abs(lastPoint[1] - lat) < 1e-5 &&
      Math.abs(lastPoint[2] - alt) < 2
    ) {
      return
    }
    newTracks[newTracks.length - 1].push([lon, lat, alt])
    updateHistoryTracks(newTracks)
  }, [lon, lat, alt])
}

export default useCollectHistoryPath
