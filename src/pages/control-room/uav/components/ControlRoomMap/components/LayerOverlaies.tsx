import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import LayerOverlaies from '@/map/CesiumMap/components/service/Overlaies/Overlaies'
import { useUavControlRoomLayoutStore } from '../../../hooks/useUavControlRoomLayout.store'

type PropsType = unknown

/** 图层和点位 */
const LayerOverlay: FC<PropsType> = () => {
  const { viewer } = useCesium()
  const updateOverlayDetailId = useUavControlRoomLayoutStore(
    (s) => s.updateOverlayDetailId,
  )
  const activeOrAppendTabAfterTab = useUavControlRoomLayoutStore(
    (s) => s.activeOrAppendTabAfterTab,
  )

  useEffect(() => {
    if (!viewer) {
      return
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

    const handleDoubleClick = (evt) => {
      const pickedObjs = viewer?.scene?.drillPick(evt.position)
      if (!pickedObjs || !pickedObjs.length) {
        return
      }

      const res = pickedObjs.find((e) => {
        if (typeof e.id === 'string' && e.id.startsWith('overlay--')) {
          return true
        }
        if (typeof e.id?.id === 'string' && e.id.id.startsWith('overlay--')) {
          return true
        }
        return false
      })

      const id = res?.id?.id ?? res?.id
      if (typeof id === 'string' && id.startsWith('overlay--')) {
        const [, overlayId] = id.split('--')
        const overlayTab = {
          key: 'overlay',
          closeable: true,
        }
        activeOrAppendTabAfterTab(overlayTab)
        updateOverlayDetailId(overlayId)
      }
    }

    handler.setInputAction(
      handleDoubleClick,
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    )
    return () => {
      handler.destroy()
    }
  }, [viewer])

  return (
    <>
      <LayerOverlaies />
    </>
  )
}

export default LayerOverlay
