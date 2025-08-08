import * as Cesium from 'cesium'
import useMixARStore from '@/store/control-room/useMixAR.store'
import GeodataRender from './GeodataRender'
import OverlayAndFlightAreaRender from './OverlayAndFlightAreaRender'
import { useEffect, useState } from 'react'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import { LayerEnum } from './Enum'

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
        const primitiveCollection = new Cesium.PrimitiveCollection()
        orderCesiumRenderController.orderPrimitives.push(primitiveCollection)
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
    </>
  )
}

ARSceneCesiumRender.displayName = 'ARSceneCesiumRender'

export default ARSceneCesiumRender
