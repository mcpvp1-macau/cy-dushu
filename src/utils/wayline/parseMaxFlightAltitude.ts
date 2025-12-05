/**
 * 解析航线参数，获取所有航点中的最高飞行高度
 * 支持多种数据结构：
 * 1. 数组元素为三元组 [lng, lat, alt]
 * 2. 数组元素为对象 { pointX, pointY, pointZ }
 * 3. 数组元素为对象 { x, y, z }
 * 4. 数组元素为对象 { lng, lat, alt }
 */
export const parseMaxFlightAltitude = (parameters: any): number | null => {
  try {
    const positions = parameters?.spaces?.[0]?.positions
    if (!Array.isArray(positions) || positions.length === 0) {
      return null
    }

    let maxAltitude: number | null = null

    for (const position of positions) {
      let altitude: number | null = null

      // 情况1：三元组数组 [lng, lat, alt]
      if (Array.isArray(position) && position.length >= 3) {
        altitude = position[2]
      }
      // 情况2：对象 { pointX, pointY, pointZ }
      else if (
        position != null &&
        typeof position === 'object' &&
        'pointZ' in position
      ) {
        altitude = position.pointZ
      }
      // 情况3：对象 { x, y, z }
      else if (
        position != null &&
        typeof position === 'object' &&
        'z' in position
      ) {
        altitude = position.z
      }
      // 情况4：对象 { lng, lat, alt }
      else if (
        position != null &&
        typeof position === 'object' &&
        'alt' in position
      ) {
        altitude = position.alt
      }

      if (altitude != null && typeof altitude === 'number') {
        if (maxAltitude === null || altitude > maxAltitude) {
          maxAltitude = altitude
        }
      }
    }

    return maxAltitude
  } catch {
    return null
  }
}
