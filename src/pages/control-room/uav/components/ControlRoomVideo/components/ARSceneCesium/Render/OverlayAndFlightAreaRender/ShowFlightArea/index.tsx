import { FC } from 'react'
import ShowNoFlyArea from './ShowNoFlyArea'
import ShowDefaultArea from './ShowDefaultArea'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
  ocrc: OrderCesiumRenderController
}

const ShowFlightArea: FC<PropsType> = ({ overlays, ocrc }) => {
  return (
    <>
      {overlays.map((overlay) => {
        if (overlay.overlayExtType === 'NO_FLY_ZONE') {
          return (
            <ShowNoFlyArea
              key={overlay.overlayId}
              overlay={overlay}
              ocrc={ocrc}
            />
          )
        }
        return (
          <ShowDefaultArea
            key={overlay.overlayId}
            overlay={overlay}
            ocrc={ocrc}
          />
        )
      })}
    </>
  )
}

ShowFlightArea.displayName = 'ShowFlightArea'

export default ShowFlightArea
