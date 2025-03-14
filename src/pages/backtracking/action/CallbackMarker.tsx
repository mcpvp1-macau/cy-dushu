import { useEffect } from 'react'
import * as Cesium from 'cesium'
import { useCesium } from 'resium'
import { useLatest } from 'ahooks'
import { attempt } from 'lodash'
import { deviceIconMap } from '@/map/GlobalMap/DeviceMarkers/OtherMarkers/OtherMarker'
type DeviceBackItem = {
  deviceType: any
  longitude: number
  latitude: number
  deviceId: string
  deviceName: string
  name: string
  type: string
}

type PropsType = {
  lng: number
  lat: number
  name: string
  deviceId: string
}

const CallbackMarker: React.FC<PropsType> = memo(
  ({ lng, lat, name, deviceId }) => {
    const { viewer } = useCesium()
    //   const position = useLatest({ lng, lat })

    useEffect(() => {
      if (viewer) {
        const entity = new Cesium.Entity({
          id: deviceId + '=back',
          position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
          billboard: {
            image: deviceIconMap['UAV'],
            width: 26,
            height: 26,
            //   disableDepthTestDistance: 50000,
            heightReference: Cesium.HeightReference.NONE,
          },
          label: {
            text: name,
            font: '700 128px Helvetica',
            scale: 0.1,
            pixelOffset: new Cesium.Cartesian2(0, 32),
            backgroundColor: Cesium.Color.BLACK,
            fillColor: Cesium.Color.WHITE,
            backgroundPadding: new Cesium.Cartesian2(5, 5),
            disableDepthTestDistance: 50000,
            heightReference: Cesium.HeightReference.NONE,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              500_000,
            ),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineColor: Cesium.Color.fromCssColorString('#000'),
            outlineWidth: 5,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          },
        })
        viewer.entities.add(entity)

        return () => {
          if (viewer) {
            attempt(() => {
              viewer.entities.remove(entity)
            })
          }
        }
      }
    }, [viewer])

    useEffect(() => {
      if (viewer) {
        const entity = viewer.entities.getById(deviceId + '=back')
        if (entity) {
          entity.position = Cesium.Cartesian3.fromDegrees(
            lng,
            lat,
            0,
          ) as unknown as Cesium.PositionProperty
        }
      }
    }, [viewer, lng, lat])

    return <></>
  },
)

export default CallbackMarker
