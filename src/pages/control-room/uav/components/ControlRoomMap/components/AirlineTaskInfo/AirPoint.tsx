import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  positionIndex: number
  lng: number
  lat: number
}

const AirPoint: FC<PropsType> = memo(({ positionIndex, lng, lat }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) return
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
      billboard: {
        image: '/images/airline/inverted-triangle.svg',
        scale: 1.15,
        eyeOffset: new Cesium.Cartesian3(0, 0, -2),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: positionIndex + 1 + '',
        font: 'bold 16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -3),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10.0),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })
    return () => {
      try {
        viewer.entities.remove(entity)
      } catch (e) {}
    }
  }, [positionIndex, lng, lat])
  return <></>
})

export default AirPoint
