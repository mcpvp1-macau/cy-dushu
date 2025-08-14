import { FC, useContext } from 'react'
import { CotType } from '@/store/map/useDraw.store'
import ShowCircle from '@/map/CesiumMap/components/service/Overlaies/ShowCircle'
import ShowPolygon from '@/map/CesiumMap/components/service/Overlaies/ShowPolygon'
import ShowFan from '@/map/CesiumMap/components/service/Overlaies/ShowFan'
import RenderOverlayLabel from './RenderOverlayLabel'
import { LayerEnum } from '../Enum'
import { ARSceneCesiumContext } from '../context'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
}

const RenderOverlays: FC<PropsType> = ({ overlays }) => {
  const { ocrc } = useContext(ARSceneCesiumContext)

  return (
    <>
      {overlays.map((overlay) => {
        if (overlay.cotType === CotType.SHAPE_CIRCLE) {
          return (
            <ShowCircle
              key={overlay.overlayId}
              overlayExtType={'overlay'}
              primitives={ocrc!.orderPrimitives[LayerEnum.overlay]}
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
              overlayExtType={'overlay'}
              primitives={ocrc!.orderPrimitives[LayerEnum.overlay]}
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
              overlayExtType={'overlay'}
              primitives={ocrc!.orderPrimitives[LayerEnum.overlay]}
              overlay={overlay}
              isGround={false}
              showLabel={false}
            />
          )
        }
      })}
      <RenderOverlayLabel overlays={overlays} />
    </>
  )
}

RenderOverlays.displayName = 'RenderOverlays'

export default memo(RenderOverlays)
