import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import { useUnmountedRef } from 'ahooks'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { fromUrl as tiffFromUrl } from 'geotiff'

/** DEM 高程限制面栅格图层的 URL */
const TIFF_URL = '/ja-map/0108/限制面栅格.tif'

/** TFW 世界文件的 URL */
const TFW_URL = '/ja-map/0108/限制面栅格.tfw'

/** 中央子午线（123°E） */
const CENTRAL_MERIDIAN = 123.0

/** 目标网格尺寸（采样后的最大行列数），用于控制精度和性能 */
const TARGET_GRID_SIZE = 512

/** NoData 阈值，小于此值的像素视为无效数据 */
const NODATA_THRESHOLD = -3.0e38

type PropsType = unknown

/** TFW 地理变换参数 */
interface GeoTransform {
  pixelSizeX: number // X 方向像素分辨率
  rotationX: number // 旋转参数
  rotationY: number // 旋转参数
  pixelSizeY: number // Y 方向像素分辨率（通常为负值）
  originX: number // 左上角 X 坐标（投影坐标）
  originY: number // 左上角 Y 坐标（投影坐标）
}

/**
 * 读取 TFW 世界文件
 * 解析 6 行参数文件
 */
async function readTFW(url: string): Promise<GeoTransform> {
  const response = await fetch(url)
  const text = await response.text()
  const lines = text
    .trim()
    .split('\n')
    .map((line) => parseFloat(line.trim()))

  if (lines.length < 6) {
    throw new Error('TFW 文件格式不正确，需要 6 个值')
  }

  return {
    pixelSizeX: lines[0],
    rotationX: lines[1],
    rotationY: lines[2],
    pixelSizeY: lines[3],
    originX: lines[4],
    originY: lines[5],
  }
}

/**
 * 像素坐标转投影坐标
 * TFW 文件中的原点是左上角像素的中心点
 */
function pixelToProjected(
  gt: GeoTransform,
  pixelX: number,
  pixelY: number,
): [number, number] {
  const projX = gt.originX + pixelX * gt.pixelSizeX + pixelY * gt.rotationX
  const projY = gt.originY + pixelX * gt.rotationY + pixelY * gt.pixelSizeY
  return [projX, projY]
}

/**
 * 高斯-克吕格投影反算（投影坐标转经纬度）
 * 使用 CGCS2000 椭球参数
 */
function gaussKrugerToLatLon(
  x: number,
  y: number,
  centralMeridian: number,
): [number, number] {
  // CGCS2000 椭球参数
  const a = 6378137.0 // 长半轴
  const f = 1.0 / 298.257222101 // 扁率

  // 计算椭球参数
  const b = a * (1 - f) // 短半轴
  const e2 = (a * a - b * b) / (a * a) // 第一偏心率的平方
  const ep2 = (a * a - b * b) / (b * b) // 第二偏心率的平方

  // 去除假东偏移（500km）
  x = x - 500000.0

  // 底点纬度计算
  const M = y // 子午线弧长
  const mu =
    M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256))

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 * e1 * e1) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * e1 * e1 * e1 * e1) / 32) * Math.sin(4 * mu) +
    ((151 * e1 * e1 * e1) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 * e1 * e1 * e1) / 512) * Math.sin(8 * mu)

  // 计算系数
  const sinPhi1 = Math.sin(phi1)
  const cosPhi1 = Math.cos(phi1)
  const tanPhi1 = Math.tan(phi1)

  const N1 = a / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1)
  const T1 = tanPhi1 * tanPhi1
  const C1 = ep2 * cosPhi1 * cosPhi1
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * sinPhi1 * sinPhi1, 1.5)
  const D = x / N1

  // 计算纬度
  let lat =
    phi1 -
    ((N1 * tanPhi1) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D * D * D * D) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) *
          D *
          D *
          D *
          D *
          D *
          D) /
          720)

  // 计算经度
  let lon =
    (centralMeridian * Math.PI) / 180 +
    (D -
      ((1 + 2 * T1 + C1) * D * D * D) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) *
        D *
        D *
        D *
        D *
        D) /
        120) /
      cosPhi1

  // 弧度转度
  lat = (lat * 180) / Math.PI
  lon = (lon * 180) / Math.PI

  return [lat, lon]
}

/**
 * 四舍五入到指定小数位
 */
function roundToDecimal(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * 检查是否为 NoData 值
 */
function isNoData(value: number): boolean {
  return value < NODATA_THRESHOLD
}

/** 上海虹桥机场高程图层组件 */
const ShanghaiHongqiaoAirportElevationLayer: FC<PropsType> = memo(() => {
  const { viewer } = useCesium()
  const unmountedRef = useUnmountedRef()
  const primitiveRef = useRef<Cesium.Primitive | null>(null)

  /** 加载 DEM 数据并创建 3D 高程表面 */
  const loadDemSurface = useMemoizedFn(async () => {
    if (!viewer) return

    // 并行读取 GeoTIFF 和 TFW 文件
    const [tiff, geoTransform] = await Promise.all([
      tiffFromUrl(TIFF_URL),
      readTFW(TFW_URL),
    ])

    const image = await tiff.getImage()
    const rasters = await image.readRasters()
    const elevationData = rasters[0] as
      | Float32Array
      | Float64Array
      | Uint8Array
      | Uint16Array

    // 获取图像尺寸
    const width = image.getWidth()
    const height = image.getHeight()

    console.log('[ShanghaiHongqiaoAirportElevationLayer] GeoTIFF 信息:', {
      width,
      height,
      geoTransform,
    })

    // 组件已卸载则不继续
    if (unmountedRef.current || !viewer) return

    // 根据图像尺寸动态计算采样步长，确保网格数量在可接受范围内
    const maxDimension = Math.max(width, height)
    const sampleStep = Math.max(1, Math.ceil(maxDimension / TARGET_GRID_SIZE))

    // 采样后的网格尺寸
    const gridWidth = Math.ceil(width / sampleStep)
    const gridHeight = Math.ceil(height / sampleStep)

    console.log(
      `[ShanghaiHongqiaoAirportElevationLayer] 原始尺寸: ${width}x${height}, 采样步长: ${sampleStep}, 网格尺寸: ${gridWidth}x${gridHeight}`,
    )

    // 第一遍扫描：找出有效高程的最大最小值，用于颜色映射
    let minElev = Infinity
    let maxElev = -Infinity
    for (let i = 0; i < elevationData.length; i++) {
      const val = elevationData[i]
      // 过滤掉 NoData 值
      if (!isNoData(val) && val > 0) {
        if (val < minElev) minElev = val
        if (val > maxElev) maxElev = val
      }
    }

    // 构建顶点位置数组
    const positions: Cesium.Cartesian3[] = []
    const colors: Cesium.Color[] = []
    // 记录每个顶点是否为有效数据（非 NoData）
    const validFlags: boolean[] = []

    // 采样网格顶点
    for (let row = 0; row < gridHeight; row++) {
      for (let col = 0; col < gridWidth; col++) {
        // 原始像素坐标
        const pixelX = Math.min(col * sampleStep, width - 1)
        const pixelY = Math.min(row * sampleStep, height - 1)
        const idx = pixelY * width + pixelX

        // 获取高程值（灰度值）
        let elevation = elevationData[idx]

        // 检查是否为 NoData
        const isValid = !isNoData(elevation) && elevation > 0
        validFlags.push(isValid)

        // NoData 时使用最小值占位（后续会跳过这些格子）
        if (!isValid) {
          elevation = minElev
        }

        // 高度四舍五入到 1 位小数
        elevation = roundToDecimal(elevation, 1)

        // 使用 TFW 地理变换将像素坐标转换为投影坐标
        const [projX, projY] = pixelToProjected(geoTransform, pixelX, pixelY)

        // 使用高斯-克吕格投影反算将投影坐标转换为经纬度
        const [lat, lon] = gaussKrugerToLatLon(projX, projY, CENTRAL_MERIDIAN)

        // 创建 3D 位置（带高程）
        positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, elevation))

        // 根据高程计算颜色（低->高：蓝->绿->黄->红）
        const normalizedElev = (elevation - minElev) / (maxElev - minElev || 1)
        colors.push(getColorForElevation(normalizedElev))
      }
    }

    // 创建多个几何实例（每个网格单元一个）
    const geometryInstances: Cesium.GeometryInstance[] = []

    for (let row = 0; row < gridHeight - 1; row++) {
      for (let col = 0; col < gridWidth - 1; col++) {
        const topLeft = row * gridWidth + col
        const topRight = topLeft + 1
        const bottomLeft = (row + 1) * gridWidth + col
        const bottomRight = bottomLeft + 1

        // 检查四个顶点是否都有效，任何一个无效则跳过该格子
        if (
          !validFlags[topLeft] ||
          !validFlags[topRight] ||
          !validFlags[bottomLeft] ||
          !validFlags[bottomRight]
        ) {
          continue
        }

        // 获取四个顶点
        const p0 = positions[topLeft]
        const p1 = positions[topRight]
        const p2 = positions[bottomRight]
        const p3 = positions[bottomLeft]

        // 使用左上角顶点的颜色作为该单元格的颜色
        const color = colors[topLeft]

        // 创建四边形几何体（由两个三角形组成）
        const instance = new Cesium.GeometryInstance({
          geometry: new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy([p0, p1, p2, p3]),
            perPositionHeight: true,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
          },
        })

        geometryInstances.push(instance)
      }
    }

    // 限制几何实例数量，防止内存溢出
    const limitedInstances = geometryInstances

    // 创建 Primitive（异步模式，避免阻塞主线程）
    const primitive = new Cesium.Primitive({
      geometryInstances: limitedInstances,
      appearance: new Cesium.PerInstanceColorAppearance({
        flat: true, // 使用平面着色，性能更好
        translucent: true,
      }),
      asynchronous: true,
    })

    // 组件已卸载则不添加
    if (unmountedRef.current || !viewer) return

    // 移除旧的 primitive
    if (primitiveRef.current) {
      attempt(() => viewer.scene.primitives.remove(primitiveRef.current))
    }

    // 添加新的 primitive
    viewer.scene.primitives.add(primitive)
    primitiveRef.current = primitive
  })

  // 初始化时加载，卸载时清理
  useEffect(() => {
    if (!viewer) return

    loadDemSurface()

    return () => {
      attempt(() => {
        if (primitiveRef.current && viewer) {
          viewer.scene.primitives.remove(primitiveRef.current)
          primitiveRef.current = null
        }
      })
    }
  }, [viewer])

  return null
})

/** 颜色不透明度 */
const COLOR_ALPHA = 0.3

/**
 * 根据归一化的高程值获取颜色
 * 使用渐变色：蓝(低) -> 青 -> 绿 -> 黄 -> 红(高)
 */
function getColorForElevation(normalized: number): Cesium.Color {
  // 确保值在 0-1 范围内
  const t = Math.max(0, Math.min(1, normalized))

  // 分段渐变
  if (t < 0.25) {
    // 蓝 -> 青
    const s = t / 0.25
    return new Cesium.Color(0, s, 1, COLOR_ALPHA)
  } else if (t < 0.5) {
    // 青 -> 绿
    const s = (t - 0.25) / 0.25
    return new Cesium.Color(0, 1, 1 - s, COLOR_ALPHA)
  } else if (t < 0.75) {
    // 绿 -> 黄
    const s = (t - 0.5) / 0.25
    return new Cesium.Color(s, 1, 0, COLOR_ALPHA)
  } else {
    // 黄 -> 红
    const s = (t - 0.75) / 0.25
    return new Cesium.Color(1, 1 - s, 0, COLOR_ALPHA)
  }
}

ShanghaiHongqiaoAirportElevationLayer.displayName =
  'ShanghaiHongqiaoAirportElevationLayer'

export default ShanghaiHongqiaoAirportElevationLayer
