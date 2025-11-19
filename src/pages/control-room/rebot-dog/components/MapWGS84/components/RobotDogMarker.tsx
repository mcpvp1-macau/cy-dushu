import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import * as Cesium from 'cesium'
import { Billboard, BillboardCollection } from 'resium'

type PropsType = unknown

const RobotDogMarker: FC<PropsType> = memo(() => {
  const lng = useRebotDogControlRoomStore((s) => s.state.longitude ?? 0)
  const lat = useRebotDogControlRoomStore((s) => s.state.latitude ?? 0)
  const realHeading =
    useRebotDogControlRoomStore((s) => s.state.headingAngle ?? 0) * -1

  const position = Cesium.Cartesian3.fromDegrees(lng, lat)

  return (
    <BillboardCollection>
      <Billboard
        position={position}
        image={'/images/marker/icon/rebot_dog.svg'}
        width={25}
        height={25}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        rotation={Cesium.Math.toRadians(-realHeading || 0)}
      />
      <Billboard
        position={position}
        image={'/images/marker/icon/rebot_dog_direction.svg'}
        width={13}
        height={13}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        rotation={Cesium.Math.toRadians(realHeading)}
        pixelOffset={
          new Cesium.Cartesian2(
            -13 * Math.sin(Cesium.Math.toRadians(realHeading)),
            -13 * Math.cos(Cesium.Math.toRadians(realHeading)),
          )
        }
      />
    </BillboardCollection>
  )
})

RobotDogMarker.displayName = 'RobotDogMarker'

export default RobotDogMarker
