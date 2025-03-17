import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import { Polyline, PolylineCollection } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

const Airpoints: FC<PropsType> = memo(() => {
  const airpoints = useAreaWaylineStore((s) => s.airpointsConfig)
  const takeOffPoint = useAreaWaylineStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const height = useAreaWaylineStore((s) => s.airlineConfig.height)

  if (!airpoints || !takeOffPoint) {
    return null
  }

  return (
    <PolylineCollection>
      {airpoints.length > 0 && (
        <>
          <Polyline
            positions={Cesium.Cartesian3.fromDegreesArrayHeights([
              takeOffPoint[0],
              takeOffPoint[1],
              0,
              takeOffPoint[0],
              takeOffPoint[1],
              height,
              airpoints[0].pointX,
              airpoints[0].pointY,
              airpoints[0].pointZ,
            ])}
            width={3}
            material={Cesium.Material.fromType('Color', {
              color: Cesium.Color.fromCssColorString('#4ade80'),
            })}
          />
          <Polyline
            positions={Cesium.Cartesian3.fromDegreesArrayHeights(
              airpoints.map((e) => [e.pointX, e.pointY, e.pointZ]).flat(),
            )}
            width={3}
            material={Cesium.Material.fromType('Color', {
              color: Cesium.Color.fromCssColorString('#4ade80'),
            })}
          />
        </>
      )}
    </PolylineCollection>
  )
})

Airpoints.displayName = 'Airpoints'

export default Airpoints
