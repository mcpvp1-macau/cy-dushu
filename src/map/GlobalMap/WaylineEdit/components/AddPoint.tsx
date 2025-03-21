import { cartesian3ToDegrees } from '@/utils/geoUtils'
import * as Cesium from 'cesium'
import { useCesium } from 'resium'

type PropsType = {
  onMapClick: (position: number[]) => void
}

/** 添加点 */
const AddPoint: FC<PropsType> = memo(({ onMapClick }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    handler.setInputAction(
      (e: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
        const ray = viewer.camera.getPickRay(e.position)
        if (!ray) return
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!cartesian) return
        const geo = cartesian3ToDegrees(cartesian)
        onMapClick(geo)
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )
    return () => {
      handler.destroy()
    }
  }, [onMapClick, viewer])

  return null
})

AddPoint.displayName = 'AddPoint'

export default AddPoint
