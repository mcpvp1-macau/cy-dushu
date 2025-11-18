import * as Cesium from 'cesium'
import useMixARStore from '@/store/control-room/useMixAR.store'
import GeodataRender from './GeodataRender'
import OverlayAndFlightAreaRender from './OverlayAndFlightAreaRender'
import { useEffect, useState } from 'react'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import { LayerLevelMap, LabelRelateMap } from './Enum'
import CollisionCheckLabelCollection from '@/utils/customPrimitive/CollisionCheckLabelCollection'
import { ARSceneCesiumContext } from './context'
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
      for (let i = 0; i < LayerLevelMap.numberOfLayer; i++) {
        if (i === LayerLevelMap.label) {
          // 为 label层级预先生成好标注及其关联显示的图元
          const labelLevelCollection = new Cesium.PrimitiveCollection()
          orderCesiumRenderController.orderPrimitives[LayerLevelMap.label] =
            labelLevelCollection
          for (let j = 0; j < LabelRelateMap.numberOfLabelRelate; j++) {
            if (j === LabelRelateMap.label) {
              labelLevelCollection.add(
                new CollisionCheckLabelCollection(
                  10,
                  false,
                  window.devicePixelRatio,
                ),
              )
            } else if (j === LabelRelateMap.poiMarker) {
              labelLevelCollection.add(new Cesium.BillboardCollection())
            } else if (j === LabelRelateMap.overlayPoint) {
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
    <ARSceneCesiumContext.Provider value={{ viewer, ocrc }}>
      <OverlayAndFlightAreaRender />
      <GeodataRender />
      <WaylineRender />
    </ARSceneCesiumContext.Provider>
  )
}

ARSceneCesiumRender.displayName = 'ARSceneCesiumRender'

export default ARSceneCesiumRender
