import { useEffect } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'

/** 取消设置起飞点和航点 */
export const useCancelSetPoint = () => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer?.scene) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    handler.setInputAction(() => {
      const store = useAirlineConfigStore.getState()
      store.updateIsDrawHome(false)
      store.updateIsDrawPoint(false)
      store.updateIsDrawRoadTarget(false)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    return () => {
      handler.destroy()
    }
  }, [])
}
