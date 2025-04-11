import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { memo, type FC } from 'react'
import { Billboard, BillboardCollection } from 'resium'
import * as Cesium from 'cesium'
import homeImg from '@/assets/marker/home.png'

type PropsType = unknown

/** 返航点图标 */
const HomeMarker: FC<PropsType> = memo(() => {
  const lng = useUavControlRoomStore((s) => s.state.gohomeLongitude) ?? 0
  const lat = useUavControlRoomStore((s) => s.state.gohomeLatitude) ?? 0

  return (
    <BillboardCollection>
      <Billboard
        position={Cesium.Cartesian3.fromDegrees(lng, lat)}
        image={homeImg}
        width={40}
        height={40}
        scale={0.7}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
      />
    </BillboardCollection>
  )
})

HomeMarker.displayName = 'HomeMarker'

export default HomeMarker
