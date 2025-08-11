import { FC, memo } from 'react'
import ShowCircle from '@/map/CesiumMap/components/service/Overlaies/ShowCircle'
import ShowFan from '@/map/CesiumMap/components/service/Overlaies/ShowFan'
import ShowPolygon from '@/map/CesiumMap/components/service/Overlaies/ShowPolygon'
import { CotType } from '@/store/map/useDraw.store'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import RenderOverlayLabel from './RenderOverlayLabel'
import { LayerEnum } from '../Enum'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
  ocrc: OrderCesiumRenderController
}

const RenderFlightArea: FC<PropsType> = ({ overlays, ocrc }) => {
  return (
    <>
      {overlays.map((overlay) => {
        if (overlay.cotType === CotType.SHAPE_CIRCLE) {
          return (
            <ShowCircle
              key={overlay.overlayId}
              primitives={ocrc.orderPrimitives[LayerEnum.overlay]}
              overlay={overlay}
              isGround={false}
              showLabel={false}
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
              primitives={ocrc.orderPrimitives[LayerEnum.overlay]}
              overlay={overlay}
              isGround={false}
              showLabel={false}
            />
          )
        }
        if (overlay.cotType === CotType.SHAPE_FAN) {
          return (
            <ShowFan
              key={overlay.overlayId}
              primitives={ocrc.orderPrimitives[LayerEnum.overlay]}
              overlay={overlay}
              isGround={false}
              showLabel={false}
            />
          )
        }
      })}
      <RenderOverlayLabel overlays={overlays} ocrc={ocrc} />
    </>
  )
}

RenderFlightArea.displayName = 'RenderFlightArea'

export default memo(RenderFlightArea)
