import CesiumMap from '@/map/CesiumMap'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import DeviceOverlays from '@/map/GlobalMap/DeviceMarkers/components/DeviceOverlays'
import UGVMarker from './components/UGVMarker'

const ControlRoomUGVMap: FC = memo(() => {
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const parentId = useDeviceDetailStore((s) => s.deviceDetail?.parentId)

  return (
    <div className="size-full">
      <CesiumMap id="ugv-control-room-map">
        <UGVMarker />
        {deviceId && <DeviceOverlays deviceId={deviceId} />}
        {parentId && <DeviceOverlays deviceId={parentId} />}
      </CesiumMap>
    </div>
  )
})

ControlRoomUGVMap.displayName = 'ControlRoomUGVMap'

export default ControlRoomUGVMap
