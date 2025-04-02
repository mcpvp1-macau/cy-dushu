import { memo, type FC } from 'react'
import { Billboard, BillboardCollection } from 'resium'
import icon from '@/assets/marker/map-marker1.png'
import * as Cesium from 'cesium'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import HistoryTrack from '@/components/map/HistoryTrack'

type PropsType = {
  position: [number, number]
}

const UavPointFlyTarget: FC<PropsType> = memo(({ position }) => {
  const lng = useUavControlRoomStore((s) => s.state.longitude) ?? 0
  const lat = useUavControlRoomStore((s) => s.state.latitude) ?? 0

  return (
    <>
      <BillboardCollection>
        <Billboard
          position={Cesium.Cartesian3.fromDegrees(position[0], position[1])}
          scale={0.4}
          image={icon}
          verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
          horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
          disableDepthTestDistance={50000}
          heightReference={Cesium.HeightReference.NONE}
        />
      </BillboardCollection>
      <HistoryTrack
        color="#3d87e9"
        useCallback
        value={[
          { lng, lat },
          { lng: position[0], lat: position[1] },
        ]}
      />
    </>
  )
})

UavPointFlyTarget.displayName = 'UavPointFlyTarget'

export default UavPointFlyTarget
