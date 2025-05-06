import { Rectangle } from 'cesium'

/** 添加边距给 Rectangle */
export function addPaddingToRectangle(
  rect: Rectangle,
  percent: number = 0.1,
): Rectangle {
  const west = rect.west
  const east = rect.east
  const south = rect.south
  const north = rect.north

  const lonDelta = (east - west) * percent
  const latDelta = (north - south) * percent

  return Rectangle.fromRadians(
    west - lonDelta,
    south - latDelta,
    east + lonDelta,
    north + latDelta,
  )
}
