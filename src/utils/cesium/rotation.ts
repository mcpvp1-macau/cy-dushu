import * as Cesium from 'cesium'

/** 计算朝向，yaw 角度值 */
export const calcYaw = (yaw: number, viewer: Cesium.Viewer | undefined) => {
  if (!viewer) {
    return 0
  }
  return (-yaw * Math.PI) / 180 + (viewer.camera?.heading ?? 0)
}

/** 根据一个点和旋转角度\距离, 计算另一个点 */
export const createROIfromRotation = (
  position: Cesium.Cartographic,
  rotation: Cesium.HeadingPitchRoll,
  length: number,
) => {
  // position: Cartographic - {latitude, longitude, altitude})
  // rotation: HeadingPitchRoll - {heading, pitch, roll}

  // Based on answer found here:
  // https://stackoverflow.com/questions/58021985/create-a-point-in-a-direction-in-cesiumjs

  const cartesianPosition =
    Cesium.Ellipsoid.WGS84.cartographicToCartesian(position)

  rotation.heading = rotation.heading - Cesium.Math.toRadians(90)
  const referenceFrame1 = Cesium.Transforms.headingPitchRollQuaternion(
    cartesianPosition,
    rotation,
  )
  const rotationMatrix = Cesium.Matrix3.fromQuaternion(
    referenceFrame1,
    new Cesium.Matrix3(),
  )
  const rotationScaled = Cesium.Matrix3.multiplyByVector(
    rotationMatrix,
    new Cesium.Cartesian3(length, 0, 0),
    new Cesium.Cartesian3(),
  )
  const roiPos = Cesium.Cartesian3.add(
    cartesianPosition,
    rotationScaled,
    new Cesium.Cartesian3(),
  )
  return roiPos
}
