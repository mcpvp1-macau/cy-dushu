import CesiumMap from '@/map/CesiumMap'
import WangLouDetailMarker from '@/map/GlobalMap/DeviceMarkers/WangLouMarkers/WangLouDetailMarker'
import UavMapInitial from '@/pages/control-room/uav/components/ControlRoomMap/components/Initial'
import WanglouUpdateRealMarker from '@/pages/right/DeviceDetail/WangLouDetail/components/UpdateRealMarker'
import { lazy, memo, Suspense, type FC } from 'react'

type PropsType = unknown

const ControlRoomWanglouMap: FC<PropsType> = memo(() => {
  return (
    <CesiumMap id="wanglou-control-room-map">
      <WangLouDetailMarker />
      <WanglouUpdateRealMarker />
      <UavMapInitial />
    </CesiumMap>
  )
})

ControlRoomWanglouMap.displayName = 'ControlRoomWanglouMap'

export default ControlRoomWanglouMap
