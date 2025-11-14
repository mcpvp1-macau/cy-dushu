import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import { useUGVControlRoomStore } from '@/store/context-store/useUGVControlRoom.store'
import { deviceIconMap } from '@/map/GlobalMap/DeviceMarkers/OtherMarkers/OtherMarker'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useShallow } from 'zustand/react/shallow'

const UGVMarker: FC = memo(() => {
  const { longitude, latitude, altitude, yaw } = useUGVControlRoomStore(
    useShallow((s) => ({
      longitude: s.state.longitude ?? 0,
      latitude: s.state.latitude ?? 0,
      altitude: s.state.altitude ?? 0,
      yaw: s.state.yaw ?? s.state.heading ?? 0,
    })),
  )

  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)

  const position = useMemo(
    () => Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude ?? 0),
    [longitude, latitude, altitude],
  )

  return (
    <>
      <Billboard
        position={position}
        image={deviceIconMap.UGV}
        width={32}
        height={32}
        disableDepthTestDistance={200000}
        rotation={Cesium.Math.toRadians(yaw ?? 0)}
        alignedAxis={Cesium.Cartesian3.UNIT_Z}
      />
      {deviceName && (
        <DeviceLabel
          text={deviceName}
          id="ugv-control-room-marker"
          position={position}
          heightReference={Cesium.HeightReference.NONE}
        />
      )}
    </>
  )
})

UGVMarker.displayName = 'UGVMarker'

export default UGVMarker
