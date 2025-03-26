import { ScanArea } from '@/hooks/device/useCollectCameraScanAreas'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import { useLatest, useThrottleEffect } from 'ahooks'
import * as turf from '@turf/turf'
import { useCesium } from 'resium'
import { attempt } from 'lodash'
import * as Cesium from 'cesium'

const Polygon: FC<{
  polygon: number[][]
}> = memo(({ polygon }) => {
  const { viewer } = useCesium()

  const polygonRef = useLatest(polygon)
  const lastResult = useRef<Cesium.Cartesian3[] | null>(null)
  const lastT = useRef(0)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const position = new Cesium.CallbackProperty(() => {
      if (polygonRef.current.length < 2) {
        return {
          positions: Cesium.Cartesian3.fromDegreesArray([0, 0, 0, 0]),
        }
      }
      const now = Date.now()
      // 如果上次计算的时间和当前时间相差小于 100ms，则返回上次计算的结果
      if (now - lastT.current < 100 && lastResult.current) {
        return { positions: lastResult.current }
      }
      // 否则重新计算
      const result = Cesium.Cartesian3.fromDegreesArray(
        [...polygonRef.current].flat(),
      )
      lastResult.current = result
      lastT.current = now
      return { positions: result }
    }, false)

    const entity = new Cesium.Entity({
      polygon: {
        hierarchy: position,
        material: Cesium.Color.fromCssColorString('#ffd0a1').withAlpha(0.4),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    })

    viewer.entities.add(entity)

    return () => {
      attempt(() => {
        viewer.entities.remove(entity)
      })
    }
  }, [viewer])

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
      <Polygon key={polygon.toString()} polygon={polygon[0]} />
    ))
  }

  if (scanArea?.geometry.type === 'Polygon') {
    return <Polygon polygon={scanArea.geometry.coordinates[0]} />
  }

  return null
})

ScanAreas.displayName = 'ScanAreas'

export default ScanAreas
