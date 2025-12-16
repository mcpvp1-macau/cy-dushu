import { shouldJson } from '@/utils/json'
import * as Cesium from 'cesium'

export const RECTANGLE_PADDING_DEGREES = 0.001
export const FLY_TO_DURATION_SECONDS = 1

const isValidCoordinateValue = (value: unknown) =>
  Number.isFinite(Number(value))

const collectCoordinates = (
  value: unknown,
  coords: [number, number][],
): void => {
  if (Array.isArray(value)) {
    if (value.length >= 2 && isValidCoordinateValue(value[0]) && isValidCoordinateValue(value[1])) {
      coords.push([Number(value[0]), Number(value[1])])
    }
    value.forEach((item) => collectCoordinates(item, coords))
    return
  }

  if (value && typeof value === 'object') {
    const lng = (value as any).lng ?? (value as any).lon ?? (value as any).longitude
    const lat = (value as any).lat ?? (value as any).latitude

    if (isValidCoordinateValue(lng) && isValidCoordinateValue(lat)) {
      coords.push([Number(lng), Number(lat)])
    }

    Object.values(value).forEach((item) => collectCoordinates(item, coords))
  }
}

export const getRectangleFromPositions = (
  overlayPositions: unknown,
): Cesium.Rectangle | undefined => {
  const positions = shouldJson<any>(overlayPositions)
  if (!positions) {
    return undefined
  }

  const coords: [number, number][] = []
  collectCoordinates(positions, coords)

  if (!coords.length) {
    return undefined
  }

  const lngs = coords.map(([lng]) => lng)
  const lats = coords.map(([, lat]) => lat)

  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)

  return Cesium.Rectangle.fromDegrees(
    minLng - RECTANGLE_PADDING_DEGREES,
    minLat - RECTANGLE_PADDING_DEGREES,
    maxLng + RECTANGLE_PADDING_DEGREES,
    maxLat + RECTANGLE_PADDING_DEGREES,
  )
}
