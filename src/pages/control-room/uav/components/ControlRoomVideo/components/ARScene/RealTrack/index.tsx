import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import ARSceneTrack from './Track'
import ARSceneRealTrack from './RealTrack'

type PropsType = unknown

/** 虚实融合 无人机 路径 */
const ARSceneUavTracks: FC<PropsType> = memo(() => {
  const hisotryTracks = useUavControlRoomStore((s) => s.historyTracks)

  return (
    <>
      {/* 历史轨迹 */}
      {hisotryTracks.slice(0, -1).map((e, i) => (
        <ARSceneTrack key={i} data={e} />
      ))}
      {hisotryTracks.length > 0 && (
        <ARSceneRealTrack data={hisotryTracks[hisotryTracks.length - 1]} />
      )}
    </>
  )
})

ARSceneUavTracks.displayName = 'ARSceneRealTrack'

export default ARSceneUavTracks
