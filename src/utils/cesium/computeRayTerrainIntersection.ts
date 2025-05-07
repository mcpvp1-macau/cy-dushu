import * as Cesium from 'cesium'

/** 计算 p1 到 p2 的射线, 与地形的第一个交点 */
export const computeRayTerrainIntersection = (
  p1: Cesium.Cartographic,
  p2: Cesium.Cartographic,
  viewer: Cesium.Viewer,
) => {
  const ray = new Cesium.Ray(
    Cesium.Cartesian3.fromRadians(p1.longitude, p1.latitude, p1.height),
    Cesium.Cartesian3.subtract(
      Cesium.Cartesian3.fromRadians(p2.longitude, p2.latitude, p2.height),
      Cesium.Cartesian3.fromRadians(p1.longitude, p1.latitude, p1.height),
      new Cesium.Cartesian3(),
    ),
  )

  // 计算射线与地球地形的交点
  const intersection = viewer.scene.globe.pick(ray, viewer.scene)
  if (Cesium.defined(intersection)) {
    const cartographic =
      viewer.scene.globe.ellipsoid.cartesianToCartographic(intersection)

    // 判断交点是否在两点之间
    const lon1 = Cesium.Math.toDegrees(p1.longitude)
    const lat1 = Cesium.Math.toDegrees(p1.latitude)
    const lon2 = Cesium.Math.toDegrees(p2.longitude)
    const lat2 = Cesium.Math.toDegrees(p2.latitude)

    const minLon = Math.min(lon1, lon2)
    const maxLon = Math.max(lon1, lon2)
    const minLat = Math.min(lat1, lat2)
    const maxLat = Math.max(lat1, lat2)

    if (
      Cesium.Math.toDegrees(cartographic.longitude) < minLon ||
      Cesium.Math.toDegrees(cartographic.longitude) > maxLon ||
      Cesium.Math.toDegrees(cartographic.latitude) < minLat ||
      Cesium.Math.toDegrees(cartographic.latitude) > maxLat
    ) {
      return null
    }

    return cartographic
  }

  return null
}
