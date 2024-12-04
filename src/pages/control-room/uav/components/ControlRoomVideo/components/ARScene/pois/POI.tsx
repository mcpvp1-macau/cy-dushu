import { memo, type FC } from 'react'
import { Billboard, Label } from 'resium'
import * as Cesium from 'cesium'
import { getPOIIcon } from './icon-map'

type PropsType = {
  data: API_GEO_SERACH.domain.POI
}

const ARScenePOI: FC<PropsType> = memo(({ data }) => {
  if (data.coordinates.length < 2) return null
  return (
    <>
      <Billboard
        key={`${'billboard'}-${data.id}`}
        id={`poi-${data.id}`}
        position={Cesium.Cartesian3.fromDegrees(
          data.coordinates[0],
          data.coordinates[1],
        )}
        image={getPOIIcon([data.midType, data.bigType])}
        width={20}
        height={20}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
        distanceDisplayCondition={new Cesium.DistanceDisplayCondition(0, 800)}
        scaleByDistance={new Cesium.NearFarScalar(0, 1, 800, 0.6)}
      />
      <Label
        position={Cesium.Cartesian3.fromDegrees(
          data.coordinates[0],
          data.coordinates[1],
        )}
        text={data.name}
        font="10px sans-serif"
        fillColor={Cesium.Color.WHITE}
        outlineColor={Cesium.Color.BLACK}
        outlineWidth={1}
        style={Cesium.LabelStyle.FILL_AND_OUTLINE}
        distanceDisplayCondition={new Cesium.DistanceDisplayCondition(0, 800)}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        pixelOffset={new Cesium.Cartesian2(0, 12)}
        scaleByDistance={new Cesium.NearFarScalar(0, 1, 800, 0.7)}
      />
    </>
  )
})

ARScenePOI.displayName = 'ARScenePOI'

export default ARScenePOI
