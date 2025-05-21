import useMixARStore from '@/store/control-room/useMixAR.store'
import useARSettingStore from '@/store/setting/useARSetting.store'
import { wgs84ToDrawingBufferCoordinates } from '@/utils/cesium/sence-transform'
import * as Cesium from 'cesium'

type PropsType = unknown

type Item = {
  type: 'aoi' | 'road'
  properties: GeoJSON.GeoJsonProperties
  coordinates: number[][]
}

/** 绘制闭合元素 (建筑) */
const drawClosedPolygon = (
  ctx: CanvasRenderingContext2D,
  vertices: number[][],
  bgColor = '#ffffff33',
  lineColor = '#000000',
  lineWidth = 2,
) => {
  ctx.beginPath()
  vertices.forEach((point, i) => {
    if (i === vertices.length - 1) {
      return
    }
    ctx.lineTo(point[0], point[1])
  })
  ctx.closePath()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = lineColor
  ctx.stroke()

  ctx.fillStyle = bgColor
  ctx.fill()
}

/** 绘制线条元素 (路) */
const drawLine = (
  ctx: CanvasRenderingContext2D,
  vertices: number[][],
  color = '#fbbf24',
  lineWidth = 3,
) => {
  ctx.lineWidth = 3 // 描边的宽度
  ctx.beginPath()
  vertices.forEach((point) => {
    ctx.lineTo(point[0], point[1])
  })
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

const ARSceneCanvas: FC<PropsType> = memo(() => {
  const aois = useMixARStore((s) => s.aois)
  const roads = useMixARStore((s) => s.roads)
  const viewer = useMixARStore((s) => s.cesiumViewer)
  const uav = useMixARStore((s) => s.uavProperties)

  const arSetting = useARSettingStore((s) => s)
  const overlaies = useMixARStore((s) => s.overlaies)

  const { aoiItems, roadItems } = useMemo(() => {
    if (!viewer?.scene) {
      return {
        aoiItems: [] as Item[],
        roadItems: [] as Item[],
      }
    }
    const aoiItems: Item[] = []
    if (arSetting.aoi.enable && aois) {
      for (const feature of aois.features) {
        const item: Item = {
          type: 'aoi',
          properties: feature.properties,
          coordinates: [],
        }
        for (const coordinates of feature.geometry.coordinates[0]) {
          const catesian = Cesium.Cartesian3.fromDegrees(
            coordinates[0],
            coordinates[1],
            coordinates[2] ?? 0,
          )
          // 获取屏幕坐标
          const screenPostion = wgs84ToDrawingBufferCoordinates(
            viewer.scene,
            catesian,
          )
          if (!screenPostion) {
            continue
          }
          item.coordinates.push([
            (screenPostion.x / viewer.resolutionScale) * 2,
            (screenPostion.y / viewer.resolutionScale) * 2,
          ])
        }
        if (item.coordinates.length < 2) {
          continue
        }
        aoiItems.push(item)
      }
    }
    if (arSetting.overlay.area && arSetting.overlay.enable && overlaies) {
      for (const feature of overlaies.features) {
        if (feature.geometry.type !== 'Polygon') {
          continue
        }
        const item: Item = {
          type: 'aoi',
          properties: feature.properties,
          coordinates: [],
        }
        for (const coordinates of feature.geometry.coordinates[0]) {
          const catesian = Cesium.Cartesian3.fromDegrees(
            coordinates[0],
            coordinates[1],
            coordinates[2] ?? 0,
          )
          // 获取屏幕坐标
          const screenPostion = wgs84ToDrawingBufferCoordinates(
            viewer.scene,
            catesian,
          )
          if (!screenPostion) {
            continue
          }
          item.coordinates.push([
            (screenPostion.x / viewer.resolutionScale) * 2,
            (screenPostion.y / viewer.resolutionScale) * 2,
          ])
        }
        if (item.coordinates.length < 2) {
          continue
        }
        aoiItems.push(item)
      }
    }
    const roadItems: Item[] = []
    if (roads) {
      for (const feature of roads.features) {
        const item: Item = {
          type: 'road',
          properties: feature.properties,
          coordinates: [],
        }
        for (const coordinates of feature.geometry.coordinates) {
          const catesian = Cesium.Cartesian3.fromDegrees(
            coordinates[0],
            coordinates[1],
            coordinates[2] ?? 0,
          )
          // 获取屏幕坐标
          const screenPostion = wgs84ToDrawingBufferCoordinates(
            viewer.scene,
            catesian,
          )
          if (!screenPostion) {
            continue
          }
          item.coordinates.push([
            (screenPostion.x / viewer.resolutionScale) * 2,
            (screenPostion.y / viewer.resolutionScale) * 2,
          ])
        }
        if (item.coordinates.length < 2) {
          continue
        }
        roadItems.push(item)
      }
    }
    return {
      aoiItems,
      roadItems,
    }
  }, [aois, roads, uav])

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!ctx) {
      return
    }

    ctx.globalCompositeOperation = 'source-over'

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const item of aoiItems) {
      if (
        !arSetting.aoi.showBuilding &&
        item.properties?.['class'] === 'building'
      ) {
        continue
      }
      drawClosedPolygon(
        ctx,
        item.coordinates as number[][],
        item.properties?.color ?? arSetting.aoi.color,
        arSetting.aoi.borderColor,
        arSetting.aoi.borderSize,
      )
    }

    for (const data of roadItems) {
      const isMain = !!data.properties?.name
      if (
        (isMain && !arSetting.mainRoad.enable) ||
        (!isMain && !arSetting.subRoad.enable)
      ) {
        continue
      }
      drawLine(
        ctx,
        data.coordinates as number[][],
        isMain ? arSetting.mainRoad.borderColor : arSetting.subRoad.borderColor,
        isMain
          ? arSetting.mainRoad.size + arSetting.mainRoad.borderSize * 2
          : arSetting.subRoad.size + arSetting.subRoad.borderSize * 2,
      )
    }

    for (const item of roadItems) {
      const isMain = !!item.properties?.name
      if (
        (isMain && !arSetting.mainRoad.enable) ||
        (!isMain && !arSetting.subRoad.enable)
      ) {
        continue
      }
      drawLine(
        ctx,
        item.coordinates as number[][],
        isMain ? arSetting.mainRoad.color : arSetting.subRoad.color,
        isMain ? arSetting.mainRoad.size : arSetting.subRoad.size,
      )

      const name = item.properties?.name ?? item.properties?.RoadName
      if (arSetting.text.enable && name) {
        ctx.fillStyle = arSetting.text.color
        ctx.strokeStyle = arSetting.text.borderColor
        ctx.lineWidth = arSetting.text.borderSize // 描边的宽度
        ctx.font = `${arSetting.text.size}px sans-serif`
        const p = item.coordinates[item.coordinates.length >> 1]
        ctx.strokeText(name, p[0], p[1])
        ctx.fillText(name, p[0], p[1])
      }
    }

    ctx.fillStyle = arSetting.text.color
    ctx.strokeStyle = arSetting.text.borderColor
    ctx.lineWidth = arSetting.text.borderSize // 描边的宽度
    ctx.font = `${arSetting.text.size}px sans-serif`

    for (const item of aoiItems) {
      if (item.properties?.name) {
        let min0 = Infinity
        let min1 = Infinity
        let max0 = -Infinity
        let max1 = -Infinity
        for (const p of item.coordinates) {
          min0 = Math.min(min0, p[0])
          min1 = Math.min(min1, p[1])
          max0 = Math.max(max0, p[0])
          max1 = Math.max(max1, p[1])
        }
        const p = [(min0 + max0) / 2, (min1 + max1) / 2]
        ctx.strokeText(item.properties.name, p[0], p[1])
        ctx.fillText(item.properties.name, p[0], p[1])
      }
    }

    for (const item of roadItems) {
      const isMain = !!item.properties?.name
      if (
        (isMain && !arSetting.mainRoad.enable) ||
        (!isMain && !arSetting.subRoad.enable)
      ) {
        continue
      }

      const name = item.properties?.name ?? item.properties?.RoadName
      if (arSetting.text.enable && name) {
        const p = item.coordinates[item.coordinates.length >> 1]
        ctx.strokeText(name, p[0], p[1])
        ctx.fillText(name, p[0], p[1])
      }
    }
  }, [aoiItems, roadItems, uav, arSetting, viewer])

  if (!viewer?.canvas?.width || !viewer?.canvas?.height) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      width={viewer.canvas.width * 2}
      height={viewer.canvas.height * 2}
      className="absolute left-0 top-0 size-full z-50"
    />
  )
})

ARSceneCanvas.displayName = 'ARSceneCanvas'

export default ARSceneCanvas
