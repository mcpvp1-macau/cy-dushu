import * as Cesium from 'cesium'

export const wgs84ToDrawingBufferCoordinates = (
  sence: Cesium.Scene,
  position: Cesium.Cartesian3,
  result?: Cesium.Cartesian2,
) => {
  const fn =
    Cesium.SceneTransforms.wgs84ToDrawingBufferCoordinates ??
    // @ts-ignore
    Cesium.SceneTransforms.worldToDrawingBufferCoordinates

  return fn(sence, position, result)
}
