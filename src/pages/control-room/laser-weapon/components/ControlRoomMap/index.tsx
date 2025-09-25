import CesiumMap from '@/map/CesiumMap'
import BoardCesium from '@/map/GlobalMap/BoardCesium'
import OtherMarkers from '@/map/GlobalMap/DeviceMarkers/OtherMarkers'
import CesiumGlobalPickEvent from '@/map/GlobalMap/GlobalPickEvent'
// import TargetPoints from '@/map/GlobalMap/TargetPoints'
import CitySituation from '@/pages/control-room/uav/components/ControlRoomMap/components/CitySituation/CitySituation'
import UavMapInitial from '@/pages/control-room/uav/components/ControlRoomMap/components/Initial'
import { memo, type FC } from 'react'

type PropsType = unknown

const ControlRoomOthersMap: FC<PropsType> = memo(() => {
  return (
    <CesiumMap id="laser-weapon-control-room-map">
      <OtherMarkers />
      {/* <TargetPoints /> */}
      <BoardCesium />
      <UavMapInitial />
      <CesiumGlobalPickEvent />
      <CitySituation />
    </CesiumMap>
  )
})

ControlRoomOthersMap.displayName = 'ControlRoomOthersMap'

export default ControlRoomOthersMap
