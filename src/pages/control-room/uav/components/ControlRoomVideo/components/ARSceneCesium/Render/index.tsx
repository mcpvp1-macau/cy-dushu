import * as Cesium from 'cesium'
import useMixARStore from '@/store/control-room/useMixAR.store'
import GeodataRender from './GeodataRender'
import OverlayAndFlightAreaRender from './OverlayAndFlightAreaRender'
import { useEffect, useState } from 'react'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import { LayerEnum, LabelRelateEnum } from './Enum'
import CollisionCheckLabelCollection from '@/utils/customPrimitive/CollisionCheckLabelCollection'
import WaylineRender from './WaylineRender'

/**只负责渲染 */
const ARSceneCesiumRender: FC = () => {
  const viewer = useMixARStore((s) => s.cesiumViewer)
  const [ocrc, setOcrc] = useState<OrderCesiumRenderController>()

  useEffect(() => {
    if (viewer) {
      const orderCesiumRenderController = new OrderCesiumRenderController(
        viewer,
      )
      // 为ocrc预先生成primitiveCollection
      for (let i = 0; i < LayerEnum.numberOfLayer; i++) {
        if (i === LayerEnum.label) {
          // 为 label层级预先生成好标注及其关联显示的图元
          const labelLevelCollection = new Cesium.PrimitiveCollection()
          orderCesiumRenderController.orderPrimitives[LayerEnum.label] =
            labelLevelCollection
          for (let j = 0; j < LabelRelateEnum.numberOfLabelRelate; j++) {
            if (j === LabelRelateEnum.label) {
              labelLevelCollection.add(new CollisionCheckLabelCollection(10))
            } else if (j === LabelRelateEnum.poiMarker) {
              labelLevelCollection.add(new Cesium.BillboardCollection())
            } else if (j === LabelRelateEnum.overlayPoint) {
              labelLevelCollection.add(new Cesium.PointPrimitiveCollection())
            }
          }
        } else {
          orderCesiumRenderController.orderPrimitives[i] =
            new Cesium.PrimitiveCollection()
        }
      }
      setOcrc(orderCesiumRenderController)
    }

    return () => {
      if (ocrc) {
        ocrc.destroy()
      }
    }
  }, [viewer])

  if (!viewer || !ocrc) {
    return null
  }

  return (
    <>
      <OverlayAndFlightAreaRender ocrc={ocrc} />
      <GeodataRender ocrc={ocrc} />
      <WaylineRender ocrc={ocrc} />
    </>
  )
}

ARSceneCesiumRender.displayName = 'ARSceneCesiumRender'

export default ARSceneCesiumRender
