import CesiumMap from '@/map/CesiumMap'
import { lazy, memo, Suspense, type FC } from 'react'
import UavMarker from './components/UavMarker'
import ResetHomePointListener from './components/ResetHomePointListener'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import HomeMarker from './components/HomeMarker'
import UavMapInitial from './components/Initial'
import UavRealTrack from './components/RealTrack'
import UavMapPointFly from './components/PointFly/PointFly'
import UavViewCombackResolver from './components/CombackResolver'
import LastestTask from './components/AirlineTaskInfo/LatestTask'
import useMixARStore from '@/store/control-room/useMixAR.store'
import MapMixAR from './components/MapMixAR'
import AppSpin from '@/components/AppSpin'

type PropsType = unknown

const MixARResolver = lazy(() => import('../MixARResolver'))
const UavFaker = lazy(() => import('../MixARResolver/UavFaker'))

const ControlRoomUavMap: FC<PropsType> = memo(() => {
  const isResetHome = useUavControlRoomStore((s) => s.flyParams.isResetHome)

  const enableMixAR = useMixARStore((s) => s.enable)

  return (
    <CesiumMap id="uav-control-room-map">
      <UavMapPointFly />
      <UavViewCombackResolver />
      <LastestTask />
      {isResetHome && <ResetHomePointListener />}
      {enableMixAR && (
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-white bg-opacity-30">
              <AppSpin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          }
        >
          <MixARResolver />
          <UavFaker />
          <MapMixAR />
        </Suspense>
      )}
      <UavMapInitial />
      <UavMarker />
      <HomeMarker />
      <UavRealTrack />
    </CesiumMap>
  )
})

ControlRoomUavMap.displayName = 'ControlRoomUavMap'

export default ControlRoomUavMap
