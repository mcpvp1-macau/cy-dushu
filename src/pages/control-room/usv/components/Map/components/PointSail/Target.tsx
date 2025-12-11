import icon from '@/assets/marker/map-marker1.png'
import HistoryTrack from '@/components/map/HistoryTrack'
import { useUsvControlRoomStore } from '@/store/context-store/useUsvControlRoom.store'
import * as Cesium from 'cesium'
import { Billboard, BillboardCollection } from 'resium'

type PropsType = {
  position: [number, number]
}

const UsvPointSailTarget: FC<PropsType> = memo(({ position }) => {
  const lng = useUsvControlRoomStore((s) => s.state.longitude) ?? 0
  const lat = useUsvControlRoomStore((s) => s.state.latitude) ?? 0

  return (
    <>
      <BillboardCollection>
        <Billboard
          position={Cesium.Cartesian3.fromDegrees(position[0], position[1], 0)}
          scale={0.4}
          image={icon}
          verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
          horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
          disableDepthTestDistance={50000}
          heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        />
      </BillboardCollection>
      <HistoryTrack
        color="#3d87e9"
        clampToGround
        value={[
          { lng, lat, alt: 0 },
          { lng: position[0], lat: position[1], alt: 0 },
        ]}
      />
    </>
  )
})

UsvPointSailTarget.displayName = 'UsvPointSailTarget'

export default UsvPointSailTarget
