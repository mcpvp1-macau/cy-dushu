import { memo, type FC } from 'react'
import { Billboard, BillboardCollection, LabelCollection } from 'resium'
import * as Cesium from 'cesium'
import { useRebotDogControlRoomStore } from '@/store/context-store/useRebotDogControlRoom.store'
import icon from '/images/marker/icon/rebot_dog.svg'
import directionIcon from '/images/marker/icon/rebot_dog_direction.svg'

type PropsType = unknown

/**
 * 机器狗实时图标
 */
const RebotDogRealMarker: FC<PropsType> = memo(() => {
  const deviceId = useRebotDogControlRoomStore((s) => s.deviceId)
  const longitude = useRebotDogControlRoomStore((s) => s.state.longitude)
  const latitude = useRebotDogControlRoomStore((s) => s.state.latitude)
  const heading =
    useRebotDogControlRoomStore((s) => s.state.headingAngle ?? 0) * -1
  if (!longitude || !latitude) {
    return null
  }

  return (
    <>
      <BillboardCollection>
        <LabelCollection>
          <Billboard
            id={`device--ROBOT_DOG--${deviceId}--${longitude}--${latitude}`}
            position={Cesium.Cartesian3.fromDegrees(longitude, latitude)}
            image={icon}
            width={25}
            height={25}
            disableDepthTestDistance={50000}
            heightReference={Cesium.HeightReference.NONE}
          />
          <Billboard
            id={`device--ROBOT_DOG--${deviceId}--${longitude}--${latitude}--direction`}
            position={Cesium.Cartesian3.fromDegrees(longitude, latitude)}
            image={directionIcon}
            width={13}
            height={13}
            disableDepthTestDistance={50000}
            heightReference={Cesium.HeightReference.NONE}
            rotation={Cesium.Math.toRadians(heading)}
            pixelOffset={
              new Cesium.Cartesian2(
                -13 * Math.sin(Cesium.Math.toRadians(heading)),
                -13 * Math.cos(Cesium.Math.toRadians(heading)),
              )
            }
          />
        </LabelCollection>
      </BillboardCollection>
    </>
  )
})

RebotDogRealMarker.displayName = 'RebotDogRealMarker'

export default RebotDogRealMarker
