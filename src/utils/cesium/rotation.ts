import * as Cesium from 'cesium'

/** 计算朝向，yaw 角度值 */
export const calcYaw = (yaw: number, viewer: Cesium.Viewer | undefined) => {
  if (!viewer) {
    return 0
  }
  return (-yaw * Math.PI) / 180 + (viewer.camera?.heading ?? 0)
}
