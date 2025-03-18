import { CotType } from '@/store/map/useDraw.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { LabelCollection, PointPrimitiveCollection } from 'resium'
import OverlayPoint from './Point'
import OverlayPolygon from './Polygon'
import { circle } from '@turf/turf'
import { shouldJson } from '@/utils/json'

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
              const overlayPositions = shouldJson(overlay.overlayPositions)[0]
              const postion = overlayPositions.slice(0, 3)
              const radius = overlayPositions[3]
              console.log(postion)
              const positions = JSON.stringify(
                circle([postion[0], postion[1]], radius, { units: 'meters' })
                  .geometry.coordinates[0],
              )
              return (
                <OverlayPolygon
                  key={overlay.overlayId}
                  data={{
                    ...overlay,
                    overlayPositions: positions,
                  }}
                />
              )
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
