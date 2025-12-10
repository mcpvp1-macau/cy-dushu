import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import * as Cesium from 'cesium'
import { Billboard, BillboardCollection } from 'resium'

const UsvMarker: FC = memo(() => {
  const lng = useUsvControlRoomStore((s) => s.state.longitude ?? 0)
  const lat = useUsvControlRoomStore((s) => s.state.latitude ?? 0)
  const heading = useUsvControlRoomStore((s) => s.state.heading ?? 0)

  const position = Cesium.Cartesian3.fromDegrees(lng, lat)
  const rotation = Cesium.Math.toRadians(-(heading || 0))

  return (
    <BillboardCollection>
      <Billboard
        position={position}
        image={'/images/marker/icon/car.svg'}
        width={28}
        height={28}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        rotation={rotation}
      />
    </BillboardCollection>
  )
})

UsvMarker.displayName = 'UsvMarker'

export default UsvMarker
