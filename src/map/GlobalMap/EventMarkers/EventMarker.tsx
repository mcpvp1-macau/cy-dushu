import { Billboard, Label } from 'resium'
import * as Cesium from 'cesium'
import shijian from '/images/marker/icon/shijian.svg'

type PropsType = {
  data: API_EVENTS.domain.Event
}

const EventMarker: FC<PropsType> = memo(({ data }) => {
  const { eventId, longitude, latitude, eventType, eventName } = data

  return (
    <>
      <Billboard
        key={eventId}
        id={`event--${eventType}--${eventName}--${eventId}--${longitude}--${latitude}`}
        position={Cesium.Cartesian3.fromDegrees(
          longitude || 120,
          latitude || 30,
        )}
        image={shijian}
        width={26}
        height={26}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
      />
      {/* <Label
        key={eventId + '-label'}
        id={eventId + '-label'}
        position={Cesium.Cartesian3.fromDegrees(
          longitude || 120,
          latitude || 30,
        )}
        scale={0.1}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        text={data.deviceName}
        outlineColor={Cesium.Color.fromCssColorString('#000')}
        outlineWidth={5}
        font="700 128px Helvetica"
        pixelOffset={new Cesium.Cartesian2(0, 25)}
        backgroundColor={Cesium.Color.BLACK}
        fillColor={Cesium.Color.WHITE}
        backgroundPadding={new Cesium.Cartesian2(5, 5)}
        disableDepthTestDistance={50000}
        style={Cesium.LabelStyle.FILL_AND_OUTLINE}
        heightReference={Cesium.HeightReference.NONE}
        distanceDisplayCondition={
          new Cesium.DistanceDisplayCondition(0, 500_000)
        }
      /> */}
    </>
  )
})

EventMarker.displayName = 'EventMarker'

export default EventMarker
