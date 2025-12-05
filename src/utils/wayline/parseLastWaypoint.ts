/**
 * 解析航线参数，获取最后一个航点的经纬度
 * 支持多种数据结构：
 * 1. 数组元素为三元组 [lng, lat, alt]
 * 2. 数组元素为对象 { pointX, pointY, pointZ }
 * 3. 数组元素为对象 { x, y, z }
 * 4. 数组元素为对象 { lng, lat, alt }
 */
export const parseLastWaypoint = (
  parameters: any,
): { lng: number; lat: number } | null => {
  try {
    const positions = parameters?.spaces?.[0]?.positions
    if (!Array.isArray(positions) || positions.length === 0) {
      return null
    }

    const lastPosition = positions[positions.length - 1]

    // 情况1：三元组数组 [lng, lat, alt]
    if (Array.isArray(lastPosition) && lastPosition.length >= 2) {
      return { lng: lastPosition[0], lat: lastPosition[1] }
    }

    // 情况2：对象 { pointX, pointY }
    if (
      lastPosition != null &&
      typeof lastPosition === 'object' &&
      'pointX' in lastPosition &&
      'pointY' in lastPosition
    ) {
      return { lng: lastPosition.pointX, lat: lastPosition.pointY }
    }

    // 情况3：对象 { x, y }
    if (
      lastPosition != null &&
      typeof lastPosition === 'object' &&
      'x' in lastPosition &&
      'y' in lastPosition
    ) {
      return { lng: lastPosition.x, lat: lastPosition.y }
    }

    // 情况4：对象 { lng, lat }
    if (
      lastPosition != null &&
      typeof lastPosition === 'object' &&
      'lng' in lastPosition &&
      'lat' in lastPosition
    ) {
      return { lng: lastPosition.lng, lat: lastPosition.lat }
    }

    return null
  } catch {
    return null
  }
}
