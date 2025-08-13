import { FC, memo, useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import CollisionCheckLabelCollection, {
  ExtendLabel,
} from '@/utils/customPrimitive/CollisionCheckLabelCollection'
import { getCenter } from '@/utils/customPrimitive/OverlayPrimitive'
import { LabelLevelEnum, LayerEnum, LabelRelateEnum } from '../Enum'
import { attempt } from 'lodash'
import { shouldJson } from '@/utils/json'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
  ocrc: OrderCesiumRenderController
}

/**渲染标绘中的名称 */
const RenderOverlayLabel: FC<PropsType> = ({ overlays, ocrc }) => {
  const preAddedLabels = useRef<ExtendLabel[]>([])

  useEffect(() => {
    const labelCollection: CollisionCheckLabelCollection =
      ocrc.orderPrimitives[LayerEnum.label].get(LabelRelateEnum.label) ||
      ocrc.orderPrimitives[LayerEnum.label].add(
        new CollisionCheckLabelCollection(10),
      )
    labelCollection.renderCount = 0

    const addedLabels: ExtendLabel[] = []
    for (let overlay of overlays) {
      const position = shouldJson(overlay.overlayPositions)
      if (!position) continue
      const center = getCenter(position)

      const label = labelCollection.add({
        id: 'point-' + overlay.overlayId,
        level: LabelLevelEnum.overlayName,
        position: Cesium.Cartesian3.fromDegrees(
          center[0],
          center[1],
          center?.[2] || 0,
        ),
        text: overlay.overlayName,
        font: '700 64px Helvetica',
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        scale: 0.2,
        disableDepthTestDistance: 50000,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineColor: Cesium.Color.BLACK, //边框颜色
        outlineWidth: 5, //边框宽度
      })
      addedLabels.push(label)
    }

    preAddedLabels.current = addedLabels

    return () => {
      attempt(() => {
        for (let deleteLabel of preAddedLabels.current) {
          labelCollection.remove(deleteLabel)
        }
      })
    }
  }, [overlays])

  return <></>
}

RenderOverlayLabel.displayName = 'RenderOverlayLabel'

export default memo(RenderOverlayLabel)
