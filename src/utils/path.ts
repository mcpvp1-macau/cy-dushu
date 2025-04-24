import * as turf from '@turf/turf'

/** 判断两个点是否几乎相同 */
export const isSame = (p1: number[], p2: number[], threshold = 1e-5) => {
  if (p1.length !== p2.length) {
    return false
  }
  return p1.every((v, i) => Math.abs(v - p2[i]) < threshold)
}

/** 判断三个点是否在一条直线上，支持3D坐标 */
export const isLine = (
  p1: number[],
  p2: number[],
  p3: number[],
  threshold = 0.1,
) => {
  const point1 = turf.point([p1[0], p1[1]])
  const point2 = turf.point([p2[0], p2[1]])
  const point3 = turf.point([p3[0], p3[1]])
  const angle1 = turf.bearing(point1, point2)
  const angle2 = turf.bearing(point2, point3)

  const sameYaw = Math.abs(angle1 - angle2) < threshold

  // 2D 情况处理
  if (p1.length === 2 && p2.length === 2 && p3.length === 2) {
    return sameYaw
  }

  // 3D 情况处理
  return sameYaw && Math.abs(p1[2] - p2[2]) < 1
}

/** 路径压缩 */
export const pathCompress = <T extends { lng: number; lat: number }>(
  data: T[],
) => {
  if (data.length < 2) {
    return data
  }
  const res = [data[0]]
  let last = data[0]
  for (let i = 1; i < data.length; i++) {
    if (isSame([data[i].lng, data[i].lat], [last.lng, last.lat])) {
      continue
    }
    if (res.length < 2) {
      res.push(data[i])
      last = data[i]
      continue
    }
    if (
      isLine(
        [res[res.length - 2].lng, res[res.length - 2].lat],
        [res[res.length - 1].lng, res[res.length - 1].lat],
        [data[i].lng, data[i].lat],
      )
    ) {
      res.pop()
    }
    res.push(data[i])
    last = data[i]
  }
  return res
}

export const pathCompress2 = <T extends { lng: number; lat: number }>(
  data: T[],
) => {
  if (data.length < 2) {
    return data
  }
  const temp = [data[0]]
  let last = data[0]
  for (let i = 1; i < data.length; i++) {
    if (
      Math.abs(data[i].lng - last.lng) > 1e-5 ||
      Math.abs(data[i].lat - last.lat) > 1e-5
    ) {
      temp.push(data[i])
      last = data[i]
    }
  }
  if (temp.length < 2) {
    return [temp[0], temp[0]]
  }
  const result = [temp[0], temp[1]]
  for (let i = 2; i < temp.length; i++) {
    // 若角度接近于直线，则删除中间点
    if (
      Math.abs(
        turf.bearing(
          turf.point([temp[i].lng, temp[i].lat]),
          turf.point([
            result[result.length - 1].lng,
            result[result.length - 1].lat,
          ]),
        ) -
          turf.bearing(
            turf.point([
              result[result.length - 1].lng,
              result[result.length - 1].lat,
            ]),
            turf.point([
              result[result.length - 2].lng,
              result[result.length - 2].lat,
            ]),
          ),
      ) < 1e-1
    ) {
      result.pop()
    }
    result.push(temp[i])
  }
  return result
}

export const pathCompress3D = <
  T extends { lng: number; lat: number; alt: number },
>(
  data: T[],
) => {
  if (data.length < 2) {
    return data
  }
  const res = [data[0]]
  let last = data[0]

  for (let i = 1; i < data.length; i++) {
    if (
      isSame(
        [data[i].lng, data[i].lat, data[i].alt],
        [last.lng, last.lat, last.alt],
      )
    ) {
      continue
    }
    if (res.length < 2) {
      res.push(data[i])
      last = data[i]
      continue
    }
    if (
      isLine(
        [
          res[res.length - 2].lng,
          res[res.length - 2].lat,
          res[res.length - 2].alt,
        ],
        [
          res[res.length - 1].lng,
          res[res.length - 1].lat,
          res[res.length - 1].alt,
        ],
        [data[i].lng, data[i].lat, data[i].alt],
      )
    ) {
      res.pop()
    }
    res.push(data[i])
    last = data[i]
  }
  return res
}
