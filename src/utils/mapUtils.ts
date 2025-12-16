import { shouldJson } from '@/utils/json'
import * as Cesium from 'cesium'

export const RECTANGLE_PADDING_DEGREES = 0.001
export const FLY_TO_DURATION_SECONDS = 1
const METERS_PER_DEGREE_LAT = 111320

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

const extractCircleInfo = (
  positions: unknown,
): { center: [number, number]; radius: number } | undefined => {
  if (!Array.isArray(positions)) {
    return undefined
  }

  for (const item of positions) {
    if (
      Array.isArray(item) &&
      item.length >= 4 &&
      isValidCoordinateValue(item[0]) &&
      isValidCoordinateValue(item[1]) &&
      isValidCoordinateValue(item[3])
    ) {
      return {
        center: [Number(item[0]), Number(item[1])],
        radius: Number(item[3]),
      }
    }

    if (Array.isArray(item)) {
      const nested = extractCircleInfo(item)
      if (nested) {
        return nested
      }
    }
  }

  return undefined
}

const metersToLongitudeDegrees = (radiusMeters: number, latitudeDegrees: number) => {
  const metersPerDegreeLongitude = Math.max(
    Math.cos(Cesium.Math.toRadians(latitudeDegrees)) * METERS_PER_DEGREE_LAT,
    1e-6,
  )

  return radiusMeters / metersPerDegreeLongitude
}

const metersToLatitudeDegrees = (radiusMeters: number) => radiusMeters / METERS_PER_DEGREE_LAT

export const getRectangleFromPositions = (
  overlayPositions: unknown,
  overlayType?: string,
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

  let minLng = Math.min(...lngs)
  let maxLng = Math.max(...lngs)
  let minLat = Math.min(...lats)
  let maxLat = Math.max(...lats)

  if (overlayType === 'CIRCULAR') {
    const circleInfo = extractCircleInfo(positions)
    if (circleInfo) {
      const lngDelta = metersToLongitudeDegrees(circleInfo.radius, circleInfo.center[1])
      const latDelta = metersToLatitudeDegrees(circleInfo.radius)

      minLng = circleInfo.center[0] - lngDelta
      maxLng = circleInfo.center[0] + lngDelta
      minLat = circleInfo.center[1] - latDelta
      maxLat = circleInfo.center[1] + latDelta
    }
  }

  return Cesium.Rectangle.fromDegrees(
    minLng - RECTANGLE_PADDING_DEGREES,
    minLat - RECTANGLE_PADDING_DEGREES,
    maxLng + RECTANGLE_PADDING_DEGREES,
    maxLat + RECTANGLE_PADDING_DEGREES,
  )
}
