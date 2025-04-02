import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useShallow } from 'zustand/react/shallow'
import MapUavRealMarker from '@/components/map/device/UavRealMarker'
import GimbalPicker from './GimbalPicker'

type PropsType = unknown

/** 无人机图标 */
const UavMarker: FC<PropsType> = memo(() => {
  const state = useUavControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude ?? 0,
      latitude: s.state.latitude ?? 0,
      altitude: s.state.altitude ?? 0,
      uavYaw: s.state.uavYaw ?? 0,
      gimbalYaw: s.state.gimbalYaw ?? 0,
    })),
  )

  return (
    <>
      <GimbalPicker />
      <MapUavRealMarker data={state} />
    </>
  )
})

UavMarker.displayName = 'UavMarker'

export default UavMarker
