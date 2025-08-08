import { FC, memo } from 'react'
import * as Cesium from 'cesium'
import ShowCircle from '@/map/CesiumMap/components/service/Overlaies/ShowCircle'
import ShowFan from '@/map/CesiumMap/components/service/Overlaies/ShowFan'
import ShowPolygon from '@/map/CesiumMap/components/service/Overlaies/ShowPolygon'
import { CotType } from '@/store/map/useDraw.store'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
  primitives: Cesium.PrimitiveCollection
}

const RenderFlightArea: FC<PropsType> = ({ overlays, primitives }) => {
  return (
    <>
      {overlays.map((overlay) => {
        if (overlay.cotType === CotType.SHAPE_CIRCLE) {
          return (
            <ShowCircle
              key={overlay.overlayId}
              primitives={primitives}
              overlay={overlay}
              isGround={false}
            />
          )
        }
        if (
          overlay.cotType === CotType.SHAPE_POLYGON ||
          overlay.cotType === CotType.SHAPE_RECT
        ) {
          return (
            <ShowPolygon
              key={overlay.overlayId}
              primitives={primitives}
              overlay={overlay}
              isGround={false}
            />
          )
        }
        if (overlay.cotType === CotType.SHAPE_FAN) {
          return (
            <ShowFan
              key={overlay.overlayId}
              primitives={primitives}
              overlay={overlay}
              isGround={false}
            />
          )
        }
      })}
    </>
  )
}

RenderFlightArea.displayName = 'RenderFlightArea'

export default memo(RenderFlightArea)
