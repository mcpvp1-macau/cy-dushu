import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import * as Cesium from 'cesium'
import { useCesium } from 'resium'

type PropsType = unknown

const RoadTargetPoint: FC<PropsType> = memo(() => {
  const isDrawRoadTarget = useAirlineConfigStore((s) => s.isDrawRoadTarget)
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) return
    if (!isDrawRoadTarget) {
      viewer.scene.canvas.style.cursor = 'default'
      return
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const ray = viewer.camera.getPickRay(e.position)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        // 地形上的点
        const geo = cartesian3ToDegrees(cartesian)

        useAirlineConfigStore.getState().updateAirlineConfig({
          ...useAirlineConfigStore.getState().airlineConfig,
          roadNetworkTargetPosition: geo,
        })

        useAirlineConfigStore.getState().updateIsDrawRoadTarget(false)
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    return () => {
      handler.destroy()
    }
  }, [isDrawRoadTarget, viewer])

  return null
})

RoadTargetPoint.displayName = 'RoadTargetPoint'

export default RoadTargetPoint
