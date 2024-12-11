type Point = [number, number]
type Polygon = Point[]

/**
 * 判断多边形是否为凸
 * @param polygon - 多边形的点数组
 * @returns 是否为凸多边形
 */
export function isConvex(polygon: Polygon): boolean {
  let s = 0
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    const c = polygon[(i + 2) % polygon.length]
    s += cross(subtract(b, a), subtract(c, b))
  }
  const f = s > 0 ? 1 : -1
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % n]
    const c = polygon[(i + 2) % n]
    if (cross(subtract(b, a), subtract(c, b)) * f < -1e-10) {
      return false
    }
  }
  return true
}

/**
 * 找到多边形中的凹点
 * @param polygon - 多边形的点数组
 * @returns 凹点及其索引的数组
 */
export function findReflexVertices(
  polygon: Polygon,
): { index: number; point: Point }[] {
  // 若 s > 0 则多边形为顺时针, 否则为逆时针
  let s = 0
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    const c = polygon[(i + 2) % polygon.length]
    s += cross(subtract(b, a), subtract(c, b))
  }
  const f = s > 0 ? 1 : -1
  const n = polygon.length
  const reflexVertices: { index: number; point: Point }[] = []
  for (let i = 0; i < n; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % n]
    const c = polygon[(i + 2) % n]
    if (cross(subtract(b, a), subtract(c, b)) * f < 0) {
      reflexVertices.push({ index: (i + 1) % n, point: b })
    }
  }
  return reflexVertices
}

/**
 * 找到多边形中的凹点
 * @param polygon - 多边形的点数组
 * @returns 凹点及其索引的数组
 */
function findFirstReflexVertex(polygon: Polygon): number {
  // 若 s > 0 则多边形为顺时针, 否则为逆时针
  let s = 0
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    const c = polygon[(i + 2) % polygon.length]
    s += cross(subtract(b, a), subtract(c, b))
  }
  const f = s > 0 ? 1 : -1
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % n]
    const c = polygon[(i + 2) % n]
    if (cross(subtract(b, a), subtract(c, b)) * f < -1e-10) {
      return (i + 1) % n
    }
  }
  return -1
}

function splitPolygon(
  polygon: Polygon,
  vertexAt: number,
  slopeK: number,
): Polygon[] {
  if (vertexAt < 0 || vertexAt >= polygon.length) {
    throw new Error('Invalid vertex index')
  }

  const vertex = polygon[vertexAt]

  const n = polygon.length
  const results: Polygon[] = []
  const b = vertex[1] - slopeK * vertex[0]
  let intersections: { index: number; point: Point }[] = []

  let leftCnt = 0,
    rightCnt = 0

  for (let i = 0; i < n; i++) {
    const u = polygon[i]
    const v = polygon[(i + 1) % n]

    // 切割线的轴点已经在边上了
    if (
      (u[0] === vertex[0] && u[1] === vertex[1]) ||
      (v[0] === vertex[0] && v[1] === vertex[1])
    ) {
      continue
    }

    // 直线 UV 和直线 Y = kX + b 的交点
    const k2 = (v[1] - u[1]) / (v[0] - u[0] || 1e-10)
    const b2 = u[1] - k2 * u[0]

    // 两条直线平行
    if (Math.abs(k2 - slopeK) < 1e-10) {
      continue
    }

    const x = (b2 - b) / (slopeK - k2)
    const y = slopeK * x + b

    // 交点不在 UV 上
    if (
      x < Math.min(u[0], v[0]) ||
      x > Math.max(u[0], v[0]) ||
      y < Math.min(u[1], v[1]) ||
      y > Math.max(u[1], v[1])
    ) {
      continue
    }

    // 找出尽可能靠近顶点的交点
    if (x < vertex[0]) {
      const existPoint = intersections.find((e) => e.point[0] < vertex[0])
      if (!existPoint) {
        intersections.push({ index: i, point: [x, y] })
      } else if (existPoint.point[0] < x) {
        existPoint.point = [x, y]
        existPoint.index = i
      }
      leftCnt++
    } else {
      const existPoint = intersections.find((e) => e.point[0] >= vertex[0])
      if (!existPoint) {
        intersections.push({ index: i, point: [x, y] })
      } else if (existPoint.point[0] > x) {
        existPoint.point = [x, y]
        existPoint.index = i
      }
      rightCnt++
    }
  }
  if (leftCnt % 2 === 0) {
    intersections = intersections.filter((e) => e.point[0] > vertex[0])
  }
  if (rightCnt % 2 === 0) {
    intersections = intersections.filter((e) => e.point[0] < vertex[0])
  }
  // 按照交点的顺序切割多边形
  let result: Point[] = [[...vertex]]
  for (let i = vertexAt + 1; i < vertexAt + n; i++) {
    const index = i % n
    result.push([...polygon[index]])
    const intersection = intersections.find((e) => e.index === index)
    if (intersection) {
      result.push([...intersection.point])
      results.push(result)
      result = [[...vertex], [...intersection.point]]
    }
  }
  // result.push([...vertex])
  results.push(result)
  return results
}

/**
 * 多边形的凸分解
 * @param polygon - 多边形的点数组
 * @param slopeK - 切割线的斜率
 * @returns 分解后的凸多边形数组
 */
export function convexDecomposition(
  polygon: Polygon,
  slopeK: number,
): Polygon[] {
  const vertexAt = findFirstReflexVertex(polygon)
  if (vertexAt < 0) {
    return [polygon]
  }
  const subPolygons = splitPolygon(polygon, vertexAt, slopeK)
  if (subPolygons.length <= 1) {
    return [polygon]
  }
  let results: Polygon[] = []
  for (const subPolygon of subPolygons) {
    results = results.concat(convexDecomposition(subPolygon, slopeK))
  }
  return results
}

// 向量工具函数
function subtract(a: Point, b: Point): Point {
  return [a[0] - b[0], a[1] - b[1]]
}

function cross(a: Point, b: Point): number {
  return a[0] * b[1] - a[1] * b[0]
}
