import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import LayerOverlaies from '@/map/CesiumMap/components/service/Overlaies/Overlaies'
import { useUavControlRoomLayoutStore } from '../../../hooks/useUavControlRoomLayout.store'
import { useLatest } from 'ahooks'
import { DynamicLayoutType } from '@/components/DynamicLayout'

type PropsType = unknown

/** 图层和点位 */
const LayerOverlay: FC<PropsType> = () => {
  const { viewer } = useCesium()

  const layout = useUavControlRoomLayoutStore((s) => s.layout)
  const updateLayout = useUavControlRoomLayoutStore((s) => s.updateLayout)
  const updateOverlayDetailId = useUavControlRoomLayoutStore(
    (s) => s.updateOverlayDetailId,
  )
  const layoutRef = useLatest(layout)

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
          updateOverlayDetailId(overlayId)
          const overlayTab = {
            key: 'overlay',
            closeable: true,
          }

          const newLayout = { ...layoutRef.current }
          let found = false

          let updateLayoutNode = (node: DynamicLayoutType) => {
            if (node.type === 'tabs') {
              const overlayIndex = node.children.findIndex(
                (tab) => tab.key === 'overlay',
              )
              if (overlayIndex >= 0) {
                node.children = [
                  ...node.children.slice(0, overlayIndex),
                  overlayTab,
                  ...node.children.slice(overlayIndex + 1),
                ]
                found = true
                node.activeKey = 'overlay'
                node.isCollapsed = false
                node.size = Math.max(node.size, 350)
                return
              }
              return
            }
            if (found) {
              return
            }
            let i = 0
            for (const child of node.children) {
              updateLayoutNode(child)
              if (found) {
                node.children = [
                  ...node.children.slice(0, i),
                  { ...child },
                  ...node.children.slice(i + 1),
                ]
                return
              }
              i++
            }
          }
          updateLayoutNode(newLayout)

          if (!found) {
            updateLayoutNode = (node: DynamicLayoutType) => {
              if (node.type === 'tabs') {
                const overlayIndex = node.children.findIndex(
                  (tab) => tab.key === 'device-data',
                )
                if (overlayIndex >= 0) {
                  node.children = [...node.children, overlayTab]
                  found = true
                  node.activeKey = 'overlay'
                  node.isCollapsed = false
                  node.size = Math.max(node.size, 350)
                  return
                }
                return
              }
              if (found) {
                return
              }
              let i = 0
              for (const child of node.children) {
                updateLayoutNode(child)
                if (found) {
                  node.children = [
                    ...node.children.slice(0, i),
                    { ...child },
                    ...node.children.slice(i + 1),
                  ]
                  return
                }
                i++
              }
            }
            updateLayoutNode(newLayout)
          }
          updateLayout(newLayout)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
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
