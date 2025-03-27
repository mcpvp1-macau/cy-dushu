import LayerPOI from './LayerPOI'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useRightMode from '@/store/layout/useRightMode.store'
import { RightModeEnum } from '@/enum/right-mode'
import LayerOverlaies from '@/map/CesiumMap/components/service/Overlaies/Overlaies'

type PropsType = unknown

const LayerOverlay: FC<PropsType> = () => {
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer) {
      return
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    handler.setInputAction((e) => {
      const pickedObject = viewer.scene.pick(e.position)
      if (Cesium.defined(pickedObject)) {
        const primitive = pickedObject.primitive
        const id = primitive.id ?? primitive._instanceIds?.[0]
        // 在这里处理双击事件，例如打印信息或执行其他操作
        if (id?.startsWith('overlay--')) {
          const overlayId = id.slice('overlay--'.length)
          updateRightMode(RightModeEnum.POINT_DETAIL)
          updateDetailId(overlayId)
        }
        if (id?.startsWith('reconstruction--')) {
          const overlayId = id.slice('reconstruction--'.length)
          updateRightMode(RightModeEnum.RECONSTRUCTION_DETAIL)
          updateDetailId(overlayId)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    return () => {
      handler.destroy()
    }
  }, [viewer])

  return (
    <>
      <LayerPOI />
      <LayerOverlaies />
    </>
  )
}

export default LayerOverlay
