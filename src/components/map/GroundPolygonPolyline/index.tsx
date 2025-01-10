import {
  GroundPolylinePrimitive,
  GroundPrimitive,
  GroundPrimitiveCollection,
} from 'resium'
import * as Cesium from 'cesium'
import * as _ from 'lodash'
type PropsType = {
  positions: { lng: number; lat: number; altitude: number }[]
  color?: string
}

/** 带边框的贴地面 */
const GroundPolygonPolyline: React.FC<PropsType> = ({
  positions,
  color = '#fff',
}) => {
  if (positions.length === 0) return null
  return (
    <>
      <GroundPrimitiveCollection>
        <GroundPolylinePrimitive
          geometryInstances={
            new Cesium.GeometryInstance({
              // id: 'PolylineGeometry',
              geometry: new Cesium.GroundPolylineGeometry({
                positions: Cesium.Cartesian3.fromDegreesArray(
                  _.flatten(positions.map((item) => [item.lng, item.lat])),
                ),
                width: 2.0,
              }),
            })
          }
          appearance={
            new Cesium.PolylineMaterialAppearance({
              material: Cesium.Material.fromType('Color', {
                color: Cesium.Color.fromCssColorString(color),
              }),
            })
          }
        />
        <GroundPrimitive
          geometryInstances={
            new Cesium.GeometryInstance({
              geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(
                  Cesium.Cartesian3.fromDegreesArray(
                    _.flatten(positions.map((item) => [item.lng, item.lat])),
                  ),
                ),
              }),
            })
          }
          appearance={
            new Cesium.MaterialAppearance({
              material: Cesium.Material.fromType('Color', {
                color: Cesium.Color.fromCssColorString(color).withAlpha(0.2),
              }),
            })
          }
        />
      </GroundPrimitiveCollection>
    </>
  )
}

export default GroundPolygonPolyline
