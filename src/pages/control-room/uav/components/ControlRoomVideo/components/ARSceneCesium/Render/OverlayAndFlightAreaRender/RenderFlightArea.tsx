import { FC, memo } from 'react'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import RenderOverlayLabel from './RenderOverlayLabel'
import ShowFlightArea from './ShowFlightArea'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
  ocrc: OrderCesiumRenderController
}

const RenderFlightArea: FC<PropsType> = ({ overlays, ocrc }) => {
  return (
    <>
      <ShowFlightArea overlays={overlays} ocrc={ocrc} />
      <RenderOverlayLabel overlays={overlays} ocrc={ocrc} />
    </>
  )
}

RenderFlightArea.displayName = 'RenderFlightArea'

export default memo(RenderFlightArea)
