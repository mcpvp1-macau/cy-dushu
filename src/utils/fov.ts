/**
 * 根据焦距和传感器尺寸计算视场角
 * @param focalLength 相机焦距
 * @param sensorSize 传感器尺寸
 * @param multi 倍率
 * @returns 视场角
 */
export const calcFov = (
  focalLength: number,
  sensorSize: number,
  multi: number,
) => {
  const adjustedFocalLength = focalLength * multi;
  return (
    2 * Math.atan(sensorSize / (2 * adjustedFocalLength)) * (180 / Math.PI)
  );
};

/**
 * 根据焦距和传感器尺寸计算视场角
 * @param focalLength 相机焦距
 * @param sensorSize 传感器尺寸
 * @param multi 倍率
 * @returns 视场角
 */
export const calcFovRadiation = (
  focalLength: number,
  sensorSize: number,
  multi: number,
) => {
  const adjustedFocalLength = focalLength * multi;
  return 2 * Math.atan(sensorSize / (2 * adjustedFocalLength));
};
