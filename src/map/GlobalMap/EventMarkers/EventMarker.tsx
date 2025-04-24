import { Billboard } from 'resium'
import * as Cesium from 'cesium'
import shijian from '/images/marker/icon/shijian.svg'
import useGroundHeight from '@/hooks/cesium/useGroundHeight'

type PropsType = {
  data: API_EVENTS.domain.Event
}

const EventMarker: FC<PropsType> = memo(({ data }) => {
  const { eventId, longitude = 0, latitude = 0, eventType, eventName } = data

  const groundHeight = useGroundHeight(longitude, latitude)

  return (
    <>
      <Billboard
        key={eventId}
        id={`event--${eventType}--${eventName}--${eventId}--${longitude}--${latitude}`}
        position={Cesium.Cartesian3.fromDegrees(
          longitude,
          latitude,
          groundHeight,
        )}
        image={shijian}
        width={26}
        height={26}
        verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
        horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        disableDepthTestDistance={50000}
        heightReference={Cesium.HeightReference.NONE}
      />
    </>
  )
})

EventMarker.displayName = 'EventMarker'

export default EventMarker
