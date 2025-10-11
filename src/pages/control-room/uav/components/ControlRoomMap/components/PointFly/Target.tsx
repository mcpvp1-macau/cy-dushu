import icon from '@/assets/marker/map-marker1.png'
import HistoryTrack from '@/components/map/HistoryTrack'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import * as Cesium from 'cesium'
import { Billboard, BillboardCollection } from 'resium'

type PropsType = {
  position: [number, number, number]
  clampToGround?: boolean
}

const UavPointFlyTarget: FC<PropsType> = memo(({ position, clampToGround }) => {
  const lng = useUavControlRoomStore((s) => s.state.longitude) ?? 0
  const lat = useUavControlRoomStore((s) => s.state.latitude) ?? 0
  const alt = useUavControlRoomStore((s) => s.state.altitude) ?? 0

  return (
    <>
      <BillboardCollection>
        <Billboard
          position={Cesium.Cartesian3.fromDegrees(
            position[0],
            position[1],
            position[2] ?? 0,
          )}
          scale={0.4}
          image={icon}
          verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
          horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
          disableDepthTestDistance={50000}
          heightReference={
            clampToGround
              ? Cesium.HeightReference.CLAMP_TO_GROUND
              : Cesium.HeightReference.NONE
          }
        />
      </BillboardCollection>
      <HistoryTrack
        color="#3d87e9"
        clampToGround={clampToGround}
        value={[
          { lng, lat, alt },
          { lng: position[0], lat: position[1], alt: position[2] ?? 0 },
        ]}
      />
    </>
  )
})

UavPointFlyTarget.displayName = 'UavPointFlyTarget'

export default UavPointFlyTarget
