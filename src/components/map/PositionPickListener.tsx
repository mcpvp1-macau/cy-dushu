import * as Cesium from 'cesium'
import { useCesium } from 'resium'

type PropsType = {
  onClick: (longitude: number, latitude: number) => void
}

/** 地图坐标点击获取 */
const PositionPickListener: FC<PropsType> = ({ onClick }) => {
  const { viewer } = useCesium()

  const handleClick = useMemoizedFn(onClick)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const cartesian = viewer.scene.pickPosition(e.position)
        if (!cartesian) {
          return
        }
        // 经纬度
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        handleClick(longitude, latitude)
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    return () => {
      handler.destroy()
    }
  }, [viewer])

  return null
}

PositionPickListener.displayName = 'PositionPickListener'

export default PositionPickListener
