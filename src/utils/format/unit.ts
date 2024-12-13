/** 格式化距离 */
export const formatDistance = (distance: number, radix = 1): string => {
  if (distance > 10_000) {
    return `${(distance / 1000).toFixed(radix)} km`
  }
  return `${distance.toFixed(radix)} m`
}
