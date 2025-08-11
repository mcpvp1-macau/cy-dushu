import { FC, memo, useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import CollisionCheckLabelCollection, {
  ExtendLabel,
} from '@/utils/customPrimitive/CollisionCheckLabelCollection'
import useARSettingStore from '@/store/setting/useARSetting.store'
import { LabelLevelEnum, LayerEnum, LabelRelateEnum } from '../Enum'
import { attempt } from 'lodash'
import { shouldJson } from '@/utils/json'

type PropsType = {
  points: API_LAYER_OVERLAY.domain.Overlay[]
  ocrc: OrderCesiumRenderController
}

/**渲染标绘中的点位 */
const RenderPoints: FC<PropsType> = ({ points, ocrc }) => {
  const preHandler = useRef<(labels: ExtendLabel[]) => void>(() => {})
  const preAddedLabels = useRef<ExtendLabel[]>([])

  useEffect(() => {
    const labelCollection: CollisionCheckLabelCollection = ocrc.orderPrimitives[
      LayerEnum.label
    ].get(LabelRelateEnum.label)
    const pointPrimitiveCollection: Cesium.PointPrimitiveCollection =
      ocrc.orderPrimitives[LayerEnum.label].get(LabelRelateEnum.poiMarker)
    labelCollection.renderCount = 0

    const addedLabels: ExtendLabel[] = []
    for (let point of points) {
      const position = shouldJson(point.overlayPositions)?.[0]
      if (!position) continue

      const label = labelCollection.add({
        id: 'point-' + point.overlayId,
        position: Cesium.Cartesian3.fromDegrees(
          position[0],
          position[1],
          position?.[2] || 0,
        ),
        text: point.overlayName,
        level: LabelLevelEnum.overlayPoint,
        pixelOffset: new Cesium.Cartesian2(0, 12),
        data: point,
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

    const handler = (labels: ExtendLabel[]) => {
      const showingLabels: ExtendLabel[] = labels.filter((label) => label.show)
      const pointLabels: ExtendLabel[] = showingLabels.filter(
        (label) => label.level === LabelLevelEnum.overlayPoint,
      )

      pointPrimitiveCollection.removeAll()
      for (let label of pointLabels) {
        const style = shouldJson(label.data?.overlayStyleConfig)

        pointPrimitiveCollection.add({
          position: label.position,
          color: Cesium.Color.fromCssColorString(style?.color?.hex || '#fff'),
          pixelSize: 10,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
        })
      }
    }

    labelCollection.on('collisionCheck', handler)
    preHandler.current = handler
    preAddedLabels.current = addedLabels

    return () => {
      attempt(() => {
        for (let deleteLabel of preAddedLabels.current) {
          labelCollection.remove(deleteLabel)
        }
        pointPrimitiveCollection.removeAll()
        labelCollection.off('collisionCheck', preHandler.current)
      })
    }
  }, [points])

  return <></>
}

RenderPoints.displayName = 'RenderPoints'

export default memo(RenderPoints)
