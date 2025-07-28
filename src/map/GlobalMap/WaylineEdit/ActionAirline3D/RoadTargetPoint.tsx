import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import { cartesian3ToDegrees } from '@/utils/geoUtils'
import * as Cesium from 'cesium'
import { useCesium } from 'resium'

type PropsType = unknown

const RoadTargetPoint: FC<PropsType> = memo(() => {
  const isDrawRoadTarget = useAirlineConfigStore((s) => s.isDrawRoadTarget)
  const { viewer } = useCesium()
  const roadNetworkTargetPosition = useAirlineConfigStore(
    (s) => s.airlineConfig.roadNetworkTargetPosition,
  )
  const openRoadNetworkMode = useAirlineConfigStore(
    (s) => s.airlineConfig.roadNetworkMode,
  )

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

  useEffect(() => {
    if (!roadNetworkTargetPosition || !openRoadNetworkMode || !viewer) {
      return
    }

    const e = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        roadNetworkTargetPosition[0],
        roadNetworkTargetPosition[1],
        roadNetworkTargetPosition[2],
      ),
      billboard: {
        image: '/images/airline/inverted-triangle-T.svg',
        height: 26,
        width: 26,
        disableDepthTestDistance: 10000,
      },
      properties: {
        xtype: 'roadTarget',
      },
    })

    return () => {
      if (viewer.entities.contains(e)) {
        viewer.entities.remove(e)
      }
    }
  }, [roadNetworkTargetPosition, openRoadNetworkMode])

  return null
})

RoadTargetPoint.displayName = 'RoadTargetPoint'

export default RoadTargetPoint
