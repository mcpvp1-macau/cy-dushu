import * as turf from '@turf/turf'

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
    if (
      Math.abs(data[i].lng - last.lng) < 1e-5 &&
      Math.abs(data[i].lat - last.lat) < 1e-5
    ) {
      continue
    }
    if (res.length < 2) {
      res.push(data[i])
      last = data[i]
      continue
    }
    const point1 = turf.point([
      res[res.length - 2].lng,
      res[res.length - 2].lat,
    ])
    const point2 = turf.point([
      res[res.length - 1].lng,
      res[res.length - 1].lat,
    ])
    const point3 = turf.point([data[i].lng, data[i].lat])
    const angle1 = turf.bearing(point1, point2)
    const angle2 = turf.bearing(point2, point3)
    if (Math.abs(angle1 - angle2) < 0.1) {
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
