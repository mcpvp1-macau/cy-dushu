import useDensityMapStore from '@/store/map/useDensityMap.store'
import { useCesium } from 'resium'
import * as h337 from 'keli-heatmap.js'
import { cellToLatLng } from 'h3-js'
import { distance, rhumbDestination, toMercator, toWgs84 } from '@turf/turf'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'

type PropsType = unknown

type Bound = {
  west: number
  south: number
  north: number
  east: number
}

const DISTANCE = 10_000 // 10km

const DensityMap: FC<PropsType> = memo(() => {
  const historydensityMap = useDensityMapStore((s) => s.densityMap)
  const realDensityMap = useDensityMapStore((s) => s.realDensityMap)

  const densityMap = useMemo(() => {
    const densityMap = new Map<
      string,
      { h3Code: string; color: string; value: number }
    >()

    historydensityMap.forEach((item) => {
      densityMap.set(item.h3Code, {
        h3Code: item.h3Code,
        color: item.color,
        value: item.value,
      })
    })

    realDensityMap.forEach((item) => {
      densityMap.set(item.h3Code, {
        h3Code: item.h3Code,
        color: item.color,
        value: item.value,
      })
    })

    return densityMap
  }, [historydensityMap, realDensityMap])

  const { currentCenterPos, resolvedData } = useMemo(() => {
    if (densityMap.size === 0) {
      return {
        currentCenterPos: [0, 0],
        resolvedData: [],
      }
    }
    let lngS = 0,
      latS = 0

    const resolvedData: { x: number; y: number; value: number }[] = []
    for (const item of densityMap.values()) {
      const [lat, lng] = cellToLatLng(item.h3Code)
      const [mLng, mLat] = toMercator([lng, lat]) // Convert to Mercator coordinates
      lngS += mLng
      latS += mLat
      resolvedData.push({
        x: mLng,
        y: mLat,
        value: item.value,
      })
    }
    const centerMeLng = lngS / densityMap.size
    const centerMeLat = latS / densityMap.size
    const [center84Lng, center84Lat] = toWgs84([centerMeLng, centerMeLat])

    return {
      currentCenterPos: [center84Lng, center84Lat],
      resolvedData,
    }
  }, [densityMap])

  const { viewer } = useCesium()

  // 中心点 (84)
  const [centerPos, setCenterPos] = useState<number[] | null>(null)
  const boundRef = useRef<Bound | null>(null)
  const heatmapRef = useRef<any>(null)
  const entityRef = useRef<Cesium.Entity | null>(null)

  // 创建热力图实例
  useEffect(() => {
    if (densityMap.size === 0) {
      return
    }
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.left = '0px'
    div.style.top = '0px'
    div.style.width = '1000px'
    div.style.height = '1000px'
    document.body.appendChild(div)

    const heatmapInstance = h337.create({
      container: div,
      radius: 2,
      maxOpacity: 0.5,
      blur: 1,
    })

    heatmapRef.current = heatmapInstance
    updateHeatmap()

    return () => {
      document.body.removeChild(div)
      heatmapInstance._renderer.canvas.remove()
      heatmapRef.current = null
    }
  }, [densityMap.size > 0])

  // 更新热力图数据
  const updateHeatmap = useMemoizedFn(() => {
    if (
      heatmapRef.current === null ||
      resolvedData.length === 0 ||
      !boundRef.current
    ) {
      return
    }

    const left = boundRef.current.west
    const width = boundRef.current.east - left
    const bottom = boundRef.current.south
    const height = boundRef.current.north - bottom

    let max = 0
    const _data = resolvedData
      .map((e) => {
        const x = Math.round(((e.x - left) / width) * 1000)
        const y = Math.round(1000 - ((e.y - bottom) / height) * 1000)
        max = Math.max(max, e.value)
        return { x, y, value: e.value }
      })
      .filter((e) => e.x > 0 && e.x < 1000 && e.y > 0 && e.y < 1000)

    heatmapRef.current.setData({
      max: max * 3,
      min: 0,
      data: _data,
    })
  })

  useEffect(() => {
    if (resolvedData.length === 0) {
      return
    }

    // 更新中心坐标
    if (!centerPos || distance(centerPos, currentCenterPos) > DISTANCE / 2) {
      setCenterPos(currentCenterPos)
      const rt = rhumbDestination(currentCenterPos, DISTANCE, 45, {
        units: 'meters',
      })
      const lb = rhumbDestination(currentCenterPos, DISTANCE, 225, {
        units: 'meters',
      })

      const [west, south] = toMercator([
        lb.geometry.coordinates[0],
        lb.geometry.coordinates[1],
      ])
      const [east, north] = toMercator([
        rt.geometry.coordinates[0],
        rt.geometry.coordinates[1],
      ])

      boundRef.current = {
        west,
        south,
        north,
        east,
      }
    }
    updateHeatmap()

    const bound = boundRef.current
    if (!bound) {
      return
    }
    const [west, south] = toWgs84([bound.west, bound.south])
    const [east, north] = toWgs84([bound.east, bound.north])
    const primitive = new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: Cesium.Rectangle.fromDegrees(west, south, east, north),
          height: 0,
        }),
      }),
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: new Cesium.Material({
          fabric: {
            type: 'Image',
            uniforms: {
              image: heatmapRef.current._renderer.canvas,
            },
          },
        }),
      }),
      asynchronous: false,
    })

    viewer?.scene.primitives.add(primitive)

    return () => {
      entityRef.current = null
      if (viewer?.scene.primitives) {
        attempt(() => {
          viewer.scene.primitives.remove(primitive)
        })
      }
    }
  }, [resolvedData, currentCenterPos])

  return null
  // return Array.from(densityMap.values()).map((e) => (
  //   <H3Primitive key={e.h3Code} h3Code={e.h3Code} color={e.color} />
  // ))
})

DensityMap.displayName = 'DensityMap'

export default DensityMap
