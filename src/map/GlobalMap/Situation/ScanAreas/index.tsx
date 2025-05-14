import { ScanArea } from '@/hooks/device/useCollectCameraScanAreas'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useThrottleEffect } from 'ahooks'
import * as turf from '@turf/turf'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

const Polygon: FC<{
  outPolygon: number[][]
  innerPolygon: number[][][]
}> = memo(({ outPolygon: polygon, innerPolygon }) => {
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer) {
      return
    }

    const primitive = new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(polygon.flat()),
            innerPolygon.map(
              (e) =>
                new Cesium.PolygonHierarchy(
                  Cesium.Cartesian3.fromDegreesArray(e.flat()),
                ),
            ),
          ),
          extrudedHeight: 0,
        }),
      }),
      appearance: new Cesium.MaterialAppearance({
        translucent: true,
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString('#ffd0a1').withAlpha(0.4),
        }),
      }),
      asynchronous: false,
    })
    viewer.scene.primitives.add(primitive)
    return () => {
      if (viewer.scene.primitives) {
        viewer.scene.primitives.remove(primitive)
      }
    }
  }, [viewer, polygon, innerPolygon])

  return null
})

type PropsType = unknown

const ScanAreas: FC<PropsType> = memo(() => {
  const scanAreas = useMapDevicesStore((s) => s.scanAreas)

  const [scanArea, setScanArea] = useState<ScanArea | null>(null)

  useThrottleEffect(
    () => {
      const areas = Object.values(scanAreas)

      if (areas.length === 0) {
        setScanArea(null)
        return
      }

      let result: GeoJSON.Feature<
        GeoJSON.Polygon | GeoJSON.MultiPolygon
      > | null = areas[0]

      for (let i = 1; i < areas.length; i++) {
        if (!result) {
          break
        }
        result = turf.union(turf.featureCollection([result, areas[i]]))
      }

      setScanArea(result)
    },
    [scanAreas],
    { wait: 1000 },
  )

  if (scanArea?.geometry.type === 'MultiPolygon') {
    return scanArea.geometry.coordinates.map((polygon) => (
      <Polygon
        key={polygon.toString()}
        outPolygon={polygon[0]}
        innerPolygon={polygon.slice(1)}
      />
    ))
  }

  if (scanArea?.geometry.type === 'Polygon') {
    return (
      <Polygon
        outPolygon={scanArea.geometry.coordinates[0]}
        innerPolygon={scanArea.geometry.coordinates.slice(1)}
      />
    )
  }

  return null
})

ScanAreas.displayName = 'ScanAreas'

export default ScanAreas
