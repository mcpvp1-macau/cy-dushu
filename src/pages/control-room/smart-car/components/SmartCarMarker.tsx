import { useSmartCarControlRoomStore } from '@/store/context-store/useSmartCarControlRoom.store'
import * as Cesium from 'cesium'
import { Billboard, BillboardCollection } from 'resium'
import DeviceLabel from '@/components/map/device/DeviceLabel'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { isNil } from 'lodash'

const SmartCarMarker: FC = memo(() => {
  const longitude = useSmartCarControlRoomStore((s) => s.state.longitude)
  const latitude = useSmartCarControlRoomStore((s) => s.state.latitude)
  const altitude = useSmartCarControlRoomStore((s) => s.state.altitude)

  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const deviceName = useDeviceDetailStore((s) => s.deviceDetail?.deviceName)

  const position = useMemo(() => {
    if (isNil(longitude) || isNil(latitude)) {
      // 边界情况：没有定位时不绘制，避免误导坐标。
      return null
    }

    return Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude ?? 0)
  }, [altitude, latitude, longitude])

  if (!position) {
    return null
  }

  return (
    <BillboardCollection>
      <Billboard
        position={position}
        image="/images/marker/icon/smart_car.svg"
        width={28}
        height={28}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
      />
      {deviceId ? (
        <DeviceLabel
          id={`smart-car-${deviceId}`}
          text={deviceName ?? ''}
          position={position}
        />
      ) : null}
    </BillboardCollection>
  )
})

SmartCarMarker.displayName = 'SmartCarMarker'

export default SmartCarMarker
