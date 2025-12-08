import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  positionIndex: number
  lng: number
  lat: number
  alt?: number
}

const AirPoint: FC<PropsType> = memo(({ positionIndex, lng, lat, alt }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) return
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat, alt ?? 0),
      billboard: {
        image: '/images/airline/inverted-triangle.svg',
        scale: 1.15,
        eyeOffset: new Cesium.Cartesian3(0, 0, -2),
      },
      label: {
        text: positionIndex + 1 + '',
        font: 'bold 16px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -3),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0.0, 0.0, -10.0),
      },
    })
    return () => {
      try {
        viewer.entities.remove(entity)
      } catch (_e) {}
    }
  }, [positionIndex, lng, lat, alt])
  return null
})

export default AirPoint
