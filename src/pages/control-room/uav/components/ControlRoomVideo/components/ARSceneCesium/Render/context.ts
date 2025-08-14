import { createContext } from 'react'
import * as Cesium from 'cesium'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'

export const ARSceneCesiumContext = createContext<{
  viewer: Cesium.Viewer | null
  ocrc: OrderCesiumRenderController | null
}>({
  viewer: null,
  ocrc: null,
})
