import useRightMode from '@/store/layout/useRightMode.store'
import useMapDrawStore from '@/store/map/useDraw.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { useCesium } from 'resium'
import { CotType } from '@/store/map/useDraw.store'
import EditPolygon from './EditPolygon'
import EditCircle from './EditCircle'
import EditFan from './EditFan'
import EditPoint from './EditPoint'

const OverlayEditor: FC = () => {
  const { viewer } = useCesium()
  const detailId = useRightMode((s) => s.detailId)
  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)
  const isEdit = useMapDrawStore((s) => s.isEdit)

  const editComp = useMemo(() => {
    if (!viewer || !detailId || !isEdit) return null

    const d = +detailId
    const editOverlay = overlayList.find((e) => e.overlayId === d)
    if (!editOverlay) return null

    if (editOverlay.cotType === CotType.POINT) {
      return <EditPoint overlay={editOverlay} viewer={viewer} />
    } else if (editOverlay.cotType === CotType.SHAPE_POLYGON) {
      return (
        <EditPolygon overlay={editOverlay} viewer={viewer} isRect={false} />
      )
    } else if (editOverlay.cotType === CotType.SHAPE_RECT) {
      return <EditPolygon overlay={editOverlay} viewer={viewer} isRect />
    } else if (editOverlay.cotType === CotType.SHAPE_CIRCLE) {
      return <EditCircle overlay={editOverlay} viewer={viewer} />
    } else if (editOverlay.cotType === CotType.SHAPE_FAN) {
      return <EditFan overlay={editOverlay} viewer={viewer} />
    }
    return null
  }, [detailId, overlayList, viewer, isEdit])

  return editComp
}

OverlayEditor.displayName = 'OverlayEditor'

export default OverlayEditor
