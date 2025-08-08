import { CotType } from '@/store/map/useDraw.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { LabelCollection, PointPrimitiveCollection, useCesium } from 'resium'
import OverlayPoint from './Point'
import useRightMode from '@/store/layout/useRightMode.store'
import useMapDrawStore from '@/store/map/useDraw.store'
import { useMapLayerAndOverlayConfigStore } from '@/store/map/useLayerAndOverlay.store'
import ShowCircle from './ShowCircle'
import ShowPolygon from './ShowPolygon'
import ShowFan from './ShowFan'
import { RightModeEnum } from '@/enum/right-mode'

type PropsType = unknown

/** 覆盖物们 */
const LayerOverlaies: FC<PropsType> = memo(() => {
  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)
  const isEdit = useMapDrawStore((s) => s.isEdit)
  const rightMode = useRightMode((s) => s.rightMode)
  const detailId = useRightMode((s) => s.detailId)
  const hiddenOverlayIds = useMapLayerAndOverlayConfigStore(
    (s) => s.hiddenOverlayIds,
  )

  // 编辑中的覆盖物同样隐藏
  const overlays = useMemo(() => {
    // 先把隐藏的去掉
    const filteredOverlays: API_LAYER_OVERLAY.domain.Overlay[] = []
    overlayList.forEach((item) => {
      if (hiddenOverlayIds.has(item.overlayId)) {
        return
      } else {
        filteredOverlays.push(item)
      }
    })

    // 如果没有进入详情，更不会在编辑，所以直接返回隐藏后的数据
    if (rightMode !== RightModeEnum.OVERLYA_DETAIL) return filteredOverlays

    // 再把编辑的去掉
    if (!detailId || !isEdit) {
      return filteredOverlays
    } else {
      const newOverlays: API_LAYER_OVERLAY.domain.Overlay[] = []
      filteredOverlays.forEach((item) => {
        if (String(item.overlayId) !== detailId) {
          newOverlays.push(item)
        }
      })
      return newOverlays
    }
  }, [detailId, overlayList, isEdit, hiddenOverlayIds])

  const { viewer } = useCesium()
  const primitives = useMemo(() => viewer?.scene.primitives, [viewer])

  return (
    <>
      <PointPrimitiveCollection>
        <LabelCollection>
          {overlays.map((overlay) => {
            if (overlay.cotType === CotType.POINT) {
              return <OverlayPoint key={overlay.overlayId} data={overlay} />
            }
            if (overlay.cotType === CotType.SHAPE_CIRCLE) {
              return (
                <ShowCircle
                  key={overlay.overlayId}
                  primitives={primitives}
                  overlay={overlay}
                />
              )
            }
            if (
              overlay.cotType === CotType.SHAPE_POLYGON ||
              overlay.cotType === CotType.SHAPE_RECT
            ) {
              return (
                <ShowPolygon
                  key={overlay.overlayId}
                  primitives={primitives}
                  overlay={overlay}
                />
              )
            }
            if (overlay.cotType === CotType.SHAPE_FAN) {
              return (
                <ShowFan
                  key={overlay.overlayId}
                  primitives={primitives}
                  overlay={overlay}
                />
              )
            }
          })}
        </LabelCollection>
      </PointPrimitiveCollection>
    </>
  )
})

LayerOverlaies.displayName = 'LayerOverlaies'

export default LayerOverlaies
