import { FC, memo, useContext, useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import CollisionCheckLabelCollection, {
  ExtendLabel,
} from '@/utils/customPrimitive/CollisionCheckLabelCollection'
import { getCenter } from '@/utils/customPrimitive/OverlayPrimitive'
import { LabelLevelMap, LayerLevelMap, LabelRelateMap } from '../Enum'
import { attempt } from 'lodash'
import { shouldJson } from '@/utils/json'
import { ARSceneCesiumContext } from '../context'

type PropsType = {
  overlays: API_LAYER_OVERLAY.domain.Overlay[]
}

/**渲染标绘中的名称 */
const RenderOverlayLabel: FC<PropsType> = ({ overlays }) => {
  const { ocrc } = useContext(ARSceneCesiumContext)

  const preAddedLabels = useRef<ExtendLabel[]>([])

  useEffect(() => {
    const labelCollection: CollisionCheckLabelCollection =
      ocrc!.orderPrimitives[LayerLevelMap.label].get(LabelRelateMap.label) ||
      ocrc!.orderPrimitives[LayerLevelMap.label].add(
        new CollisionCheckLabelCollection(10),
      )
    labelCollection.renderCount = 0

    const addedLabels: ExtendLabel[] = []
    for (const overlay of overlays) {
      const position = shouldJson(overlay.overlayPositions)
      if (!position) continue
      const center = getCenter(position)

      const label = labelCollection.add({
        id: 'point-' + overlay.overlayId,
        level: LabelLevelMap.overlayName,
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
        for (const deleteLabel of preAddedLabels.current) {
          labelCollection.remove(deleteLabel)
        }
      })
    }
  }, [overlays])

  return <></>
}

RenderOverlayLabel.displayName = 'RenderOverlayLabel'

export default memo(RenderOverlayLabel)
