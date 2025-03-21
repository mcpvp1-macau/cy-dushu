import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'

/** 取消设置起飞点和航点 */
export const useCancelSetPoint = () => {
  const { viewer } = useCesium()
  const setIsDrawPoint = useRebotDogWaylineStore((s) => s.updateIsDrawPoint)

  useEffect(() => {
    if (!viewer?.scene) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    handler.setInputAction(() => {
      setIsDrawPoint(false)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    return () => {
      handler.destroy()
    }
  }, [])
}
