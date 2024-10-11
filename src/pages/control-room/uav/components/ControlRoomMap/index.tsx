import CesiumMap from '@/map/CesiumMap'
import { memo, type FC } from 'react'
import UavMarker from './components/UavMarker'
import ResetHomePointListener from './components/ResetHomePointListener'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import HomeMarker from './components/HomeMarker'
import UavMapInitial from './components/Initial'
import UavRealTrack from './components/RealTrack'
import UavMapPointFly from './components/PointFly/PointFly'

type PropsType = unknown

const ControlRoomUavMap: FC<PropsType> = memo(() => {
  const isResetHome = useUavControlRoomStore((s) => s.flyParams.isResetHome)

  return (
    <CesiumMap id="uav-control-room-map">
      <UavMapInitial />
      <UavMarker />
      <HomeMarker />
      <UavRealTrack />
      <UavMapPointFly />
      {isResetHome && <ResetHomePointListener />}
    </CesiumMap>
  )
})

ControlRoomUavMap.displayName = 'ControlRoomUavMap'

export default ControlRoomUavMap
