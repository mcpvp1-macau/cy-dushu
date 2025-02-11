import CesiumMap from '@/map/CesiumMap'
import WangLouDetailMarker from '@/map/GlobalMap/DeviceMarkers/WangLouMarkers/WangLouDetailMarker'
import UavMapInitial from '@/pages/control-room/uav/components/ControlRoomMap/components/Initial'
import WanglouUpdateRealMarker from '@/pages/right/DeviceDetail/WangLouDetail/components/UpdateRealMarker'
import { lazy, memo, Suspense, type FC } from 'react'
import TargetPoints from '@/map/GlobalMap/TargetPoints'
import BoardCesium from '@/map/GlobalMap/BoardCesium'
import WangLouMarkers from '@/map/GlobalMap/DeviceMarkers/WangLouMarkers/index'
import DrawMapPosition from './DrawMapPosition'

type PropsType = unknown

const ControlRoomWanglouMap: FC<PropsType> = memo(() => {
  return (
    <CesiumMap id="wanglou-control-room-map">
      <WangLouMarkers />
      <WangLouDetailMarker />
      <WanglouUpdateRealMarker />
      <TargetPoints />
      <BoardCesium />
      <UavMapInitial />
      <DrawMapPosition />
    </CesiumMap>
  )
})

ControlRoomWanglouMap.displayName = 'ControlRoomWanglouMap'

export default ControlRoomWanglouMap
