import { Cartesian2, Cartesian3, Cartographic, Math as CMath, Viewer } from 'cesium'
import * as turf from '@turf/turf'

export const cartesian3ToDegrees = (cartesian: Cartesian3) => {
  const cartographic = Cartographic.fromCartesian(cartesian)
  const longitude = Number(CMath.toDegrees(cartographic.longitude).toFixed(6))
  const latitude = Number(CMath.toDegrees(cartographic.latitude).toFixed(6))
  return [longitude, latitude, cartographic.height]
}

export const getPointFromWindowCoords = (viewer: Viewer, windowCoords: Cartesian2) => {
  const ray = viewer.camera.getPickRay(windowCoords)
  if (!ray) return
  const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
  if (!cartesian) return
  // 地形上的点
  const point = cartesian3ToDegrees(cartesian).slice(0, 2) as [
    number,
    number,
  ]
  return point
}

/**通过圆心与半径计算出圆的操作点 */
export const getPositionsByLlhr = (lnglatRadius: number[]) => {
  const coord = [lnglatRadius[0], lnglatRadius[1]] as [number, number];
  const distance = lnglatRadius[3];

  const destination1 = turf.destination(coord, distance, 90, {
    units: 'meters',
  });

  return destination1.geometry.coordinates as [number, number];
};

export const getRadiusByPositions = (
  position1: [number, number],
  position2: [number, number],
) => {
  const distance = turf.distance(turf.point(position1), turf.point(position2), {
    units: 'meters',
  });

  return parseFloat(distance.toFixed(6));
};
