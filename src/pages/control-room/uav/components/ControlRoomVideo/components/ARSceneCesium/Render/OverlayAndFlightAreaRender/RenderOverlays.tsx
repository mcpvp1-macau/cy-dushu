import { FC } from 'react'
import { CotType } from '@/store/map/useDraw.store'
import ShowCircle from '@/map/CesiumMap/components/service/Overlaies/ShowCircle'
import ShowPolygon from '@/map/CesiumMap/components/service/Overlaies/ShowPolygon'
import ShowFan from '@/map/CesiumMap/components/service/Overlaies/ShowFan'
import RenderOverlayLabel from './RenderOverlayLabel'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import { LayerEnum } from '../Enum'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
  ocrc: OrderCesiumRenderController
}

const RenderOverlays: FC<PropsType> = ({ overlays, ocrc }) => {
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

RenderOverlays.displayName = 'RenderOverlays'

export default memo(RenderOverlays)
