import { convexDecomposition } from '@/utils/geometry/polygon'
import { expose } from 'comlink'

type Point = [number, number]

type Polygon = Point[]

/** 面状航线 */
class AreaWaylinePathSolution {
  private polygons: Polygon[]
  private idMap: Map<string, number>
  private idToPoint: Point[]
  private polyIdGroup: number[][]
  // 从点 x 到点 y 的最短路径
  private w: number[][]
  // 从点 x 到点 y 的最短路径的下一个点
  private f: number[][]
  // 从点 x 到多边形 Y 的最短路径的(在多边形 Y 上)点
  private pointToPolyon: number[][]

  constructor(polygons: Polygon[]) {
    this.polygons = polygons
    this.idMap = new Map()
    this.idToPoint = []
    for (const polyg of polygons) {
      for (const p of polyg) {
        const ps = p.toString()
        if (!this.idMap.has(ps)) {
          this.idMap.set(ps, this.idMap.size)
          this.idToPoint.push([...p])
        }
      }
    }

    this.polyIdGroup = Array.from({ length: polygons.length }).map(() => [])

    polygons.forEach((polyg, i) => {
      polyg.forEach((p) => {
        this.polyIdGroup[i].push(this.idMap.get(p.toString())!)
      })
    })
    const n = this.idMap.size
    const w = Array.from({ length: n }).map(() =>
      Array.from({ length: n }, () => Number.MAX_VALUE / 2),
    )
    const f = Array.from({ length: n }).map(() =>
      Array.from({ length: n }, () => -1),
    )

    // Floyd init
    for (let i = 0; i < n; i++) {
      w[i][i] = 0
      f[i][i] = i
    }
    for (const polyg of polygons) {
      for (let i = 0; i < polyg.length; i++) {
        const p1 = polyg[i]
        const p1Id = this.idMap.get(p1.toString())!
        for (let j = i + 1; j < polyg.length; j++) {
          const p2 = polyg[j]
          const p2Id = this.idMap.get(p2.toString())!
          const dis = Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)
          w[p1Id][p2Id] = dis
          w[p2Id][p1Id] = dis
          f[p1Id][p2Id] = p2Id
          f[p2Id][p1Id] = p1Id
        }
      }
    }

    // Floyd
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (w[i][j] > w[i][k] + w[k][j]) {
            w[i][j] = w[i][k] + w[k][j]
            f[i][j] = f[i][k]
          }
        }
      }
    }

    const pointToPolyon = Array.from({ length: n }, () =>
      Array.from({ length: polygons.length }, () => -1),
    )

    for (let i = 0; i < polygons.length; i++) {
      const poly1 = polygons[i]
      for (let j = 0; j < polygons.length; j++) {
        if (i == j) {
          continue
        }
        const poly2 = polygons[j]
        for (let k = 0; k < poly1.length; k++) {
          const p1 = poly1[k]
          const p1Id = this.idMap.get(p1.toString())!
          for (let l = 0; l < poly2.length; l++) {
            const p2 = poly2[l]
            const p2Id = this.idMap.get(p2.toString())!
            if (pointToPolyon[p1Id][j] === -1) {
              pointToPolyon[p1Id][j] = p2Id
            } else if (w[p1Id][p2Id] < w[p1Id][pointToPolyon[p1Id][j]]) {
              pointToPolyon[p1Id][j] = p2Id
            }
          }
        }
      }
    }

    this.w = w
    this.f = f
    this.pointToPolyon = pointToPolyon
  }

  /** 获取从 x 到 y 的最短路径 */
  private getPath(x: number, y: number): number[] {
    const f = this.f
    const path = [x]
    let cur = x
    while (cur !== -1 && f[cur][y] !== y) {
      path.push(f[cur][y])
      cur = f[cur][y]
    }
    if (cur === -1) {
      return []
    }
    return path
  }

  public getPolygonPath(
    polygon: Polygon,
    k: number,
    delta: number,
    startPoint: Point,
    start: number,
  ) {
    let a = Math.atan(k)
    if (a < 0) {
      a += Math.PI
    }

    let start2 = Infinity,
      end2 = -Infinity
    polygon.forEach((point) => {
      const [x, y] = point
      const b = y - k * x
      const t = b * Math.cos(a) * -1
      start2 = Math.min(start2, t)
      end2 = Math.max(end2, t)
    })

    const intersections: Point[] = []

    const multi = Math.ceil((start2 - start) / delta)
    // console.log(start, start2, start + multi * delta)
    // 可以用 start 开始, 使用 start + multi * delta 可以减少计算量
    for (let t = start + multi * delta; t < end2; t += delta) {
      const b = -t / Math.cos(a)
      const intersectionPoints: number[][] = []
      for (let i = 0; i < polygon.length; i++) {
        const [x1, y1] = polygon[i]
        const [x2, y2] = polygon[(i + 1) % polygon.length]
        let x: number, y: number
        if (x1 !== x2) {
          const k2 = (y2 - y1) / (x2 - x1)
          const b2 = y1 - k2 * x1
          x = (b2 - b) / (k - k2)
          y = k * x + b
        } else {
          x = x1
          y = k * x + b
        }
        const minX = Math.min(x1, x2)
        const maxX = Math.max(x1, x2)
        const minY = Math.min(y1, y2)
        const maxY = Math.max(y1, y2)
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          intersectionPoints.push([x, y])
        }
      }
      if (intersectionPoints.length < 2) {
        continue
      }
      intersectionPoints.sort()
      for (let i = 0; i < intersectionPoints.length - 1; i += 2) {
        const [x1, y1] = intersectionPoints[i]
        const [x2, y2] = intersectionPoints[i + 1]
        intersections.push([x1, y1], [x2, y2])
      }
    }

    if (intersections.length === 0) {
      return []
    }

    // 从 start 到最近的交点
    let startId = -1
    let minDis = Number.MAX_VALUE
    for (const i of [
      0,
      0 ^ 1,
      intersections.length - 1,
      (intersections.length - 1) ^ 1,
    ]) {
      const point = intersections[i]
      const dis =
        (point[0] - startPoint[0]) ** 2 + (point[1] - startPoint[1]) ** 2
      if (dis < minDis) {
        minDis = dis
        startId = i
      }
    }

    const deg = Array.from({ length: intersections.length }).map(() => 1)
    const n = intersections.length

    deg[startId] = 2
    deg[startId ^ 1] = 2
    const path: number[] = [startId, startId ^ 1]

    const dfs = (x: number) => {
      const pointX = intersections[x]
      let v = -1
      let dv = Infinity
      for (let y = 0; y < n; y++) {
        if (deg[y] > 1) {
          continue
        }
        const pointY = intersections[y]
        const dis = (pointX[0] - pointY[0]) ** 2 + (pointX[1] - pointY[1]) ** 2
        if (dis < dv) {
          dv = dis
          v = y
        }
      }
      if (v === -1) {
        return
      }
      const u = v ^ 1
      deg[v]++
      deg[u]++
      path.push(v, u)
      dfs(u)
    }
    dfs(startId ^ 1)
    return path.map((x) => intersections[x])
  }

  public getAreaPath(start: Point, k: number, delta: number): Point[] {
    const m = this.polygons.length
    let a = Math.atan(k)
    if (a < 0) {
      a += Math.PI
    }
    let minDis = Number.MAX_VALUE
    let curVertex = -1
    let curPolygonId = -1
    let scanStart = Infinity
    this.polygons.forEach((polyg, i) => {
      polyg.forEach((p) => {
        const dis = (p[0] - start[0]) ** 2 + (p[1] - start[1]) ** 2
        if (dis < minDis) {
          minDis = dis
          curVertex = this.idMap.get(p.toString())!
          curPolygonId = i
        }
        const [x, y] = p
        const b = y - k * x
        const t = b * Math.cos(a) * -1
        scanStart = Math.min(scanStart, t)
      })
    })

    const res: Point[] = []

    const vis = Array.from({ length: m }, () => false)
    let visCnt = 0
    while (visCnt < m) {
      vis[curPolygonId] = true
      visCnt++
      const currentPoint = this.idToPoint[curVertex]
      const path = this.getPolygonPath(
        this.polygons[curPolygonId],
        k,
        delta,
        this.idToPoint[curVertex],
        scanStart,
      )

      res.push([...currentPoint])
      res.push(...path.map((e) => [...e] as Point))

      const last = path[path.length - 1] ?? currentPoint
      let minDis = Number.MAX_VALUE
      let targetSelfPointId = -1
      let targetPolygonId = -1

      this.polygons[curPolygonId].forEach((p) => {
        const pId = this.idMap.get(p.toString())!
        const disToSelfVertex = Math.sqrt(
          (p[0] - last[0]) ** 2 + (p[1] - last[1]) ** 2,
        )
        for (let j = 0; j < m; j++) {
          if (vis[j]) {
            continue
          }
          const targetPointId = this.pointToPolyon[pId][j]
          if (targetPointId === -1) {
            continue
          }
          const dis = disToSelfVertex + this.w[pId][targetPointId]
          if (dis < minDis) {
            minDis = dis
            targetSelfPointId = pId
            targetPolygonId = j
          }
        }
      })

      if (targetSelfPointId === -1) {
        break
      }

      res.push([...this.idToPoint[targetSelfPointId]])

      const road = this.getPath(
        targetSelfPointId,
        this.pointToPolyon[targetSelfPointId][targetPolygonId],
      ).map((e) => [...this.idToPoint[e]] as Point)
      res.push(...road)

      curPolygonId = targetPolygonId
      curVertex = this.pointToPolyon[targetSelfPointId][targetPolygonId]
    }

    return res
  }
}

const WaylineAreaPath = {
  solve(polygon: Polygon, k: number, delta: number, start: Point = [0, 0]) {
    const polygons = convexDecomposition(polygon, k)
    const solution = new AreaWaylinePathSolution(polygons)
    return solution.getAreaPath(start, k, delta)
  },
}

export type WorkerAPI = typeof WaylineAreaPath

expose(WaylineAreaPath)
