import { useEffect } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'

/** 取消设置起飞点和航点 */
export const useCancelSetPoint = () => {
  const { viewer } = useCesium()
  const setIsDrawHome = useAirlineConfigStore((s) => s.updateIsDrawHome)
  const setIsDrawPoint = useAirlineConfigStore((s) => s.updateIsDrawPoint)

  useEffect(() => {
    if (!viewer?.scene) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    handler.setInputAction(() => {
      setIsDrawPoint(false)
      setIsDrawHome(false)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    return () => {
      handler.destroy()
    }
  }, [])
}
