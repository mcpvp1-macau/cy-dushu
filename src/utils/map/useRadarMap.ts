import { queryTerrainElevation } from '@/utils/map/queryTerrainElevation'
import * as turf from '@turf/turf'
import * as Cesium from 'cesium'

type Position = {
  lng: number
  lat: number
  alt: number
}

const getIntersectPoint = async (startPoint, endPoint, rSum) => {
  const { lng: startLng, lat: startLat, alt: startAlt } = startPoint
  const { lng: endLng, lat: endLat, alt: endAlt } = endPoint
  let a = endLng
  let b = endLat
  let c = endAlt
  const pointSum = rSum || 1000 // 插值数
  let offset, x, y, height
  for (let i = 0; i < pointSum; ++i) {
    offset = i / (pointSum - 1)
    x = Cesium.Math.lerp(startLng, endLng, offset)
    y = Cesium.Math.lerp(startLat, endLat, offset)
    height = Cesium.Math.lerp(startAlt, endAlt, offset)
    // 获取海拔
    const alt = await queryTerrainElevation(x, y)
    if (alt > height) {
      a = x
      b = y
      c = alt
      break
    }
  }
  return [a, b, c]
}
const start = async (
  params,
  /** 检测结束 */
  callback: (data: string) => void,
  /** 检测进度 */
  callback1: (pross: number) => void,
) => {
  const { r, rSum, angleSum, angle, longitude, latitude, altitude } = params

  const endPoints: Position[] = []

  // 算出360度方向的坐标
  for (let index = 0; index < angleSum; index += 361 / angleSum) {
    const point = turf.point([longitude, latitude])
    const distance = r
    const bearing = index
    const options = { units: 'kilometers' } as any
    const destination = turf.destination(
      point,
      distance / 1000,
      bearing,
      options,
    )
    const [ln, la] = destination.geometry.coordinates
    const height = Math.tan(Math.abs(90 - angle)) * distance
    let alt1 = altitude
    if (angle > 0) {
      alt1 = altitude + height
    } else if (angle < 0) {
      alt1 = altitude - height
    }
    endPoints.push({ lng: ln, lat: la, alt: alt1 })
  }

  const polyline: any[] = []
  for (let index = 0; index < endPoints.length; index++) {
    const point = endPoints[index]
    // 获取每个角度上最近的与地形相交的点
    const [a, b, c] = await getIntersectPoint(
      { lng: longitude, lat: latitude, alt: altitude },
      point,
      rSum,
    )
    polyline.push({ lng: a, lat: b, altitude: c })
    //   setPross(() => index / (3 * angleSum))
    callback1?.(index / (3 * angleSum))
  }
  //
  callback?.(
    JSON.stringify({
      r,
      rSum,
      angleSum,
      angle1: angle,
      data: [polyline],
    }),
  )
}

export default { start }
