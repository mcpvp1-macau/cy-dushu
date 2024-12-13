import * as Cesium from 'cesium'
import { wgs84ToDrawingBufferCoordinates } from './sence-transform'
import { limitNum } from '../math'

/** 获取 Cesium 场景中某一个在视口中的位置 */
export function getWindowPostion(
  viewer: Cesium.Viewer,
  coordinatesOrCatesian: number[] | Cesium.Cartesian3,
): { x: number; y: number } {
  if (!(coordinatesOrCatesian instanceof Cesium.Cartesian3)) {
    coordinatesOrCatesian = Cesium.Cartesian3.fromDegrees(
      coordinatesOrCatesian[0],
      coordinatesOrCatesian[1],
      coordinatesOrCatesian[2] ?? 0,
    )
  }

  const screenPostion = wgs84ToDrawingBufferCoordinates(
    viewer.scene,
    coordinatesOrCatesian,
  )
  const rect = viewer.scene.canvas.getBoundingClientRect()

  const left =
    limitNum(
      Math.floor(screenPostion.x / viewer.resolutionScale),
      0,
      rect.width,
    ) + rect.left

  const top =
    limitNum(
      Math.floor(screenPostion.y / viewer.resolutionScale),
      0,
      rect.height,
    ) + rect.top

  return { x: left, y: top }
}
