import useRightMode from '@/store/layout/useRightMode.store'
import useMapDrawStore from '@/store/map/useDraw.store'
import useFlightAreaStore from '@/store/map/useFlightArea.store'
import { useCesium } from 'resium'
import { CotType } from '@/store/map/useDraw.store'
import EditPolygon from './EditPolygon'
import EditCircle from './EditCircle'
import EditFan from './EditFan'

const FlightAreaEditor: FC = () => {
  const { viewer } = useCesium()
  const detailId = useRightMode((s) => s.detailId)
  const flightAreaList = useFlightAreaStore((s) => s.flightAreaList)
  const isEdit = useMapDrawStore((s) => s.isEdit)

  const editComp = useMemo(() => {
    if (!viewer || !detailId || !isEdit) return <></>

    const d = +detailId
    const editOverlay = flightAreaList.find((e) => e.overlayId === d)

    if (!editOverlay) return <></>

    if (editOverlay.cotType === CotType.SHAPE_POLYGON) {
      return (
        <EditPolygon overlay={editOverlay} viewer={viewer} isRect={false} />
      )
    } else if (editOverlay.cotType === CotType.SHAPE_RECT) {
      return <EditPolygon overlay={editOverlay} viewer={viewer} isRect={true} />
    } else if (editOverlay.cotType === CotType.SHAPE_CIRCLE) {
      return <EditCircle overlay={editOverlay} viewer={viewer} />
    } else if (editOverlay.cotType === CotType.SHAPE_FAN) {
      return <EditFan overlay={editOverlay} viewer={viewer} />
    }
    return <></>
  }, [detailId, flightAreaList, viewer, isEdit])

  return editComp
}

FlightAreaEditor.displayName = 'FlightAreaEditor'

export default FlightAreaEditor
