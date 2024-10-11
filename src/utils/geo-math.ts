import {
  Cartesian3,
  Cartographic,
  EllipsoidGeodesic,
  Math as CMath,
} from 'cesium';
import * as turf from '@turf/turf';

export const cartesian3ToDegrees = (cartesian: Cartesian3) => {
  const cartographic = Cartographic.fromCartesian(cartesian);
  const longitude = Number(CMath.toDegrees(cartographic.longitude).toFixed(6));
  const latitude = Number(CMath.toDegrees(cartographic.latitude).toFixed(6));
  return [longitude, latitude, cartographic.height];
};

export const get3DTan = (p1: number[], p2: number[]) => {
  const z = p2[2] - p1[2];
  return (
    z /
    turf.rhumbDistance(turf.point([p1[0], p1[1]]), turf.point([p2[0], p2[1]]))
  );
};

export const fromDegrees = (position: number[]) => {
  const [lng, lat, height] = position;
  return Cartesian3.fromDegrees(
    Number(Number(lng).toFixed(6)) || 120,
    Number(Number(lat).toFixed(6)) || 30,
    Number(height) || 0,
  );
};

export function getSpaceDistance(positions: number[][]) {
  let distance = 0;
  for (let i = 0; i < positions.length - 1; i++) {
    const point1cartographic = Cartographic.fromCartesian(
      fromDegrees(positions[i]),
    );
    const point2cartographic = Cartographic.fromCartesian(
      fromDegrees(positions[i + 1]),
    );
    /**根据经纬度计算出距离**/
    const geodesic = new EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    let s = geodesic.surfaceDistance;
    //返回两点之间的距离
    s = Math.sqrt(
      Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2),
    );
    distance = distance + s;
  }
  return distance;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  // 将度数转换为弧度
  lat1 = toRadians(lat1);
  lon1 = toRadians(lon1);
  lat2 = toRadians(lat2);
  lon2 = toRadians(lon2);

  // 计算经度差
  const deltaLon = lon2 - lon1;

  // 计算方位角
  const x = Math.sin(deltaLon) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  let initialBearing = Math.atan2(x, y);

  // 将弧度转换为度数
  initialBearing = toDegrees(initialBearing);

  // 调整结果到0-360度范围
  const compassBearing = (initialBearing + 360) % 360;

  return compassBearing;
}
