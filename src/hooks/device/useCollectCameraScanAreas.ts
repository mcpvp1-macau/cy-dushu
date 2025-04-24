import { GimbalPick } from '@/utils/cesium/camera/camera-vertex-pick'
import * as turf from '@turf/turf'

export type ScanArea = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>

const useCollectCameraScanAreas = (
  gimbalPick: GimbalPick,
  onResult: (scanArea: ScanArea) => void,
) => {
  const unionRef = useRef<ScanArea | null>(null)

  useEffect(() => {
    if (!gimbalPick) {
      return
    }

    const { leftTop, rightTop, leftBottom, rightBottom } = gimbalPick

    if (!leftTop || !rightTop || !leftBottom || !rightBottom) {
      return
    }

    try {
      const polygon1 = turf.polygon([
        [leftTop, rightTop, rightBottom, leftBottom, leftTop],
      ])

      if (unionRef.current) {
        let union = turf.union(
          turf.featureCollection([unionRef.current, polygon1]),
        )

        if (!union) {
          union = turf.simplify(polygon1, {
            tolerance: 0.00005,
            highQuality: true,
          })
        }

        if (union) {
          unionRef.current = union
        }
      } else {
        unionRef.current = polygon1
      }
      onResult(unionRef.current!)
    } catch (error) {
      console.error(error)
    }
  }, [gimbalPick])
}

export default useCollectCameraScanAreas
