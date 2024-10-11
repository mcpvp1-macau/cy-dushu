import { CotType } from '@/store/map/useDraw.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { LabelCollection, PointPrimitiveCollection } from 'resium'
import OverlayPoint from './Point'
import OverlayCircle from './Circle'
import OverlayPolygon from './Polygon'

type PropsType = unknown

/** 覆盖物们 */
const LayerOverlaies: FC<PropsType> = memo(() => {
  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)
  return (
    <>
      <PointPrimitiveCollection>
        <LabelCollection>
          {overlayList.map((overlay) => {
            if (overlay.cotType === CotType.POINT) {
              return <OverlayPoint key={overlay.overlayId} data={overlay} />
            }
            if (overlay.cotType === CotType.SHAPE_CIRCLE) {
              return <OverlayCircle key={overlay.overlayId} data={overlay} />
            }
            if (overlay.cotType === CotType.SHAPE_POLYGON) {
              return <OverlayPolygon key={overlay.overlayId} data={overlay} />
            }
          })}
        </LabelCollection>
      </PointPrimitiveCollection>
    </>
  )
})

LayerOverlaies.displayName = 'LayerOverlaies'

export default LayerOverlaies
