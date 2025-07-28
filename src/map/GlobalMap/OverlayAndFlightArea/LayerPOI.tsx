import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { Billboard, BillboardCollection } from 'resium'
import point from '@/assets/marker/point.png'
import * as Cesium from 'cesium'
import { bigFlyEmitter } from '../BigFlyListener'

type PropsType = unknown

/** POI 点位 */
const LayerPOI: FC<PropsType> = memo(() => {
  const activePOI = useMapLayerAndOverlayStore((s) => s.activePOI)

  useEffect(() => {
    if (!activePOI) {
      return
    }
    bigFlyEmitter.emit('bigFly', { lng: activePOI.lng, lat: activePOI.lat })
  }, [activePOI])

  if (!activePOI) {
    return null
  }

  return (
    <BillboardCollection>
      <Billboard
        key={activePOI.placeId}
        id={`poi--${activePOI.placeId}`}
        position={Cesium.Cartesian3.fromDegrees(
          activePOI.lng || 120,
          activePOI.lat || 30,
        )}
        image={point}
        width={32}
        height={32}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
      />
    </BillboardCollection>
  )
})

LayerPOI.displayName = 'LayerPOI'

export default LayerPOI
