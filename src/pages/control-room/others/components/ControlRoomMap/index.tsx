import CesiumMap from '@/map/CesiumMap'
import OtherMarkers from '@/map/GlobalMap/DeviceMarkers/OtherMarkers'
import UavMapInitial from '@/pages/control-room/uav/components/ControlRoomMap/components/Initial'
// import WanglouUpdateRealMarker from '@/pages/right/DeviceDetail/WangLouDetail/components/UpdateRealMarker'
import { lazy, memo, Suspense, type FC } from 'react'

type PropsType = unknown

const ControlRoomOthersMap: FC<PropsType> = memo(() => {
  return (
    <CesiumMap id="wanglou-control-room-map">
      <OtherMarkers />
      {/* <WanglouUpdateRealMarker /> */}
      <UavMapInitial />
    </CesiumMap>
  )
})

ControlRoomOthersMap.displayName = 'ControlRoomOthersMap'

export default ControlRoomOthersMap
