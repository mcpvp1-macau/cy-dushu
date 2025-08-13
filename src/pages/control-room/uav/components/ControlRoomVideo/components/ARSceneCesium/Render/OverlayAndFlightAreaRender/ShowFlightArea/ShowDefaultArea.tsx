import ShowCircle from '@/map/CesiumMap/components/service/Overlaies/ShowCircle'
import ShowPolygon from '@/map/CesiumMap/components/service/Overlaies/ShowPolygon'
import ShowFan from '@/map/CesiumMap/components/service/Overlaies/ShowFan'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import { LayerEnum } from '../../Enum'
import { CotType } from '@/store/map/useDraw.store'
import { FC } from 'react'

type PropsType = {
  overlay: API_LAYER_OVERLAY.domain.Overlay
  ocrc: OrderCesiumRenderController
}

const ShowDefaultArea: FC<PropsType> = ({ overlay, ocrc }) => {
  if (overlay.cotType === CotType.SHAPE_CIRCLE) {
    return (
      <ShowCircle
        key={overlay.overlayId}
        primitives={ocrc.orderPrimitives[LayerEnum.flightArea]}
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
        primitives={ocrc.orderPrimitives[LayerEnum.flightArea]}
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
        primitives={ocrc.orderPrimitives[LayerEnum.flightArea]}
        overlay={overlay}
        isGround={false}
        showLabel={false}
      />
    )
  }

  return null
}

ShowDefaultArea.displayName = 'ShowDefaultArea'

export default ShowDefaultArea
