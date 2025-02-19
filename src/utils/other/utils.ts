// @ts-nocheck

import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'

dayjs.extend(utc)

// const { Cesium } = window as any;

/**
 * 墨卡托转经纬度
 * @param {*} mercator
 * @returns
 */
export const mercatorTolonlat = (mercator: Array<number>) => {
  const lonlat = [0, 0]
  const x = (mercator[0] / 20037508.34) * 180
  let y = (mercator[1] / 20037508.34) * 180
  y =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((y * Math.PI) / 180)) - Math.PI / 2)
  lonlat[0] = x
  lonlat[1] = y
  return lonlat
}

// openlayer, 一圈===2PI,从Math.PI的单位转换成-360~360度
export const fromDegree = (degree: number) => {
  return (degree / 360) * 2 * Math.PI
}

// openlayer，从-360~360度转换成Math.PI的单位
export const toDegree = (rotation: number) => {
  return (rotation / (2 * Math.PI)) * 360
}

const { originDeviceLng, originDeviceLat } = globalConfig

export const fromDegrees: (position: Array<number | string>) => any = (
  position,
) => {
  const [lng, lat, height] = position
  return Cesium.Cartesian3.fromDegrees(
    Number(Number(lng).toFixed(6)) || originDeviceLng,
    Number(Number(lat).toFixed(6)) || originDeviceLat,
    Number(height) || 0,
  )
}

// Cartesian3转经纬度
export const toDegrees = (cartesian3: any) => {
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian3)
  const lon = Cesium.Math.toDegrees(cartographic.longitude)
  const lat = Cesium.Math.toDegrees(cartographic.latitude)
  return [lon, lat, cartographic.height]
}

// export const hexToARGB = (hex: string) => {
//   // 去掉颜色代码中的 # 号
//   let h = hex.replace('#', '');

//   // 将十六进制颜色代码转换为十进制数值
//   const r = parseInt(h.substring(0, 2), 16);
//   const g = parseInt(h.substring(2, 4), 16);
//   const b = parseInt(h.substring(4, 6), 16);

//   // 计算 ARGB 值
//   const argb = -16777216 | (r << 16) | (g << 8) | b;

//   // 返回 ARGB 值
//   return argb;
// };

// // argb -> 十六进制
// export const argbToHex = (decimalColor: number) => {
//   // 将10进制颜色值转换为RGB值
//   const r = (decimalColor >> 16) & 0xff;
//   const g = (decimalColor >> 8) & 0xff;
//   const b = decimalColor & 0xff;
//   // 将RGB值转换为16进制颜色值
//   const hexColor =
//     '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
//   return hexColor;
// };

// 111212 => [#fff, 0.3]
export function argbToHex(argb: string): [hex: string, alpha: number] {
  // if (!argb || argb === 'undefined') return ['#ffffff', 1];

  if (argb === '0' || !argb || argb === 'undefined') return ['#ffffff', 0]
  const str = (parseInt(argb) >>> 0).toString(16)

  const alpha = parseInt(str.slice(0, 2), 16) / 255
  const hex = `#${str.slice(2)}`

  return [hex, alpha]
}

// #ffffff => 11112312
export function hexToARGB(hexColor: string) {
  // if (hexColor === '0') return 0;

  if (!hexColor || hexColor === 'undefined') return 2147483647
  // 去掉"#"字符
  let newHexColor = hexColor.replace('#', '')

  // 如果是6位颜色值，则在前面添加"FF"表示完全不透明的alpha值
  if (newHexColor.length === 6) {
    newHexColor = `FF${newHexColor}`
  }

  // 将8位16进制颜色值转换为32位整数值
  let argbValue = parseInt(newHexColor, 16)

  // 整数的范围是从-2147483648到2147483647，如果一个数字大于2147483647，则它被视为负数
  if (argbValue > 2147483647) {
    argbValue = -(4294967296 - argbValue)
  }

  // 返回ARGB数字颜色
  return argbValue
}

export function getIsRect(posArr: number[][]) {
  if (!posArr || posArr.length < 4) return false
  const one = posArr[0]
  const two = posArr[2]

  return (
    (posArr[1].some((val) => val === one[0]) ||
      posArr[1].some((val) => val === one[1])) &&
    (posArr[3].some((val) => val === two[0]) ||
      posArr[3].some((val) => val === two[1]))
  )
}

export function getHexWithAlpha(hex: string, alpha: number) {
  // 将透明度值乘以255
  const alphaInt = Math.round(alpha * 255)

  // 将8位整数值转换为16进制字符串
  const hexString = alphaInt.toString(16).padStart(2, '0')

  // 返回16进制颜色值
  return `#${hexString}${hex.replace('#', '')}` // "00000000"表示完全不透明，"FF000000"表示完全透明
}

export function getLngLatFromDist(
  lng: number,
  lat: number,
  brng: number,
  dist: number,
) {
  const a = 6378137
  const b = 6356752.3142
  const f = 1 / 298.257223563

  const lon1 = lng * 1
  const lat1 = lat * 1
  const s = dist
  const alpha1 = brng * (Math.PI / 180)
  const sinAlpha1 = Math.sin(alpha1)
  const cosAlpha1 = Math.cos(alpha1)
  const tanU1 = (1 - f) * Math.tan(lat1 * (Math.PI / 180))
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1),
    sinU1 = tanU1 * cosU1
  const sigma1 = Math.atan2(tanU1, cosAlpha1)
  const sinAlpha = cosU1 * sinAlpha1
  const cosSqAlpha = 1 - sinAlpha * sinAlpha
  const uSq = (cosSqAlpha * (a * a - b * b)) / (b * b)
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)))
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)))
  let sigma = s / (b * A),
    sigmaP = 2 * Math.PI
  let sinSigma = Math.sin(sigma)
  let cosSigma = Math.cos(sigma)
  let cos2SigmaM = Math.cos(2 * sigma1 + sigma)

  while (Math.abs(sigma - sigmaP) > 1e-12) {
    cos2SigmaM = Math.cos(2 * sigma1 + sigma)
    sinSigma = Math.sin(sigma)
    cosSigma = Math.cos(sigma)
    const deltaSigma =
      B *
      sinSigma *
      (cos2SigmaM +
        (B / 4) *
          (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
            (B / 6) *
              cos2SigmaM *
              (-3 + 4 * sinSigma * sinSigma) *
              (-3 + 4 * cos2SigmaM * cos2SigmaM)))
    sigmaP = sigma
    sigma = s / (b * A) + deltaSigma
  }

  const tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1
  const lat2 = Math.atan2(
    sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
    (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp),
  )
  const lambda = Math.atan2(
    sinSigma * sinAlpha1,
    cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1,
  )
  const C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha))
  const L =
    lambda -
    (1 - C) *
      f *
      sinAlpha *
      (sigma +
        C *
          sinSigma *
          (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)))

  // const revAz = Math.atan2(sinAlpha, -tmp); // final bearing

  const lngLatObj = {
    lng: lon1 + L * (180 / Math.PI),
    lat: lat2 * (180 / Math.PI),
  }
  return lngLatObj
}

export function getSpaceDistance(positions: number[][]) {
  let distance = 0
  for (let i = 0; i < positions.length - 1; i++) {
    const point1cartographic = Cesium.Cartographic.fromCartesian(
      fromDegrees(positions[i]),
    )
    const point2cartographic = Cesium.Cartographic.fromCartesian(
      fromDegrees(positions[i + 1]),
    )
    /**根据经纬度计算出距离**/
    const geodesic = new Cesium.EllipsoidGeodesic()
    geodesic.setEndPoints(point1cartographic, point2cartographic)
    let s = geodesic.surfaceDistance
    //返回两点之间的距离
    s = Math.sqrt(
      Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2),
    )
    distance = distance + s
  }
  return distance
}

export function getLngLatHFromCartesian(viewer: any, click: any): number[] {
  const ray = viewer.camera.getPickRay(click.position || click.endPosition)
  const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
  // debugger;

  if (Cesium.defined(cartesian)) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5)
    const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5)
    const height = cartographic.height.toFixed(1)

    const pos = [longitude, latitude, height].map((item) => Number(item))

    return pos
  }

  return []
}

export const getCenter = (points: number[][]) => {
  const features = turf.points(points)

  const center = turf.center(features)

  return center.geometry.coordinates
}

export const getDistance = (points: number[][]) => {
  // let line = turf.lineString(points);
  // let length = turf.length(line, { units: 'meters' });

  let total = 0

  points?.forEach((point, idx) => {
    if (idx === points.length - 1) return
    const nextPoint = points[idx + 1]
    const line = turf.lineString([point, nextPoint])
    const length = turf.length(line, { units: 'meters' })

    if (point.length > 2) {
      const height = point[2] - nextPoint[2]
      const threeLength = Math.sqrt(Math.pow(height, 2) + Math.pow(length, 2))
      // console.log(height, length, threeLength);
      total += threeLength
    } else {
      total += length
    }
  })

  return total
}

export const getArea = (points: number[][]) => {
  const polygon = turf.polygon([points])

  const area = turf.area(polygon)

  return area
}

export const getDay = () => {
  const today = dayjs().utc().toISOString()
  const tomorrow = dayjs().utc().add(1, 'day').toISOString()

  return [today, tomorrow]
}

/**
 * 获取圆的GeoJson对象
 * @param center 圆心
 * @param radius 半径
 * @param opt 配置，详情见turf配置
 * @returns
 */
export function getCircleGeoJSON(
  center: number[],
  radius: number,
  opt: any = {
    units: 'meters',
    steps: 64,
  },
) {
  return turf.circle(center, radius, opt)
}

export function getDistancePoint(
  point1: number[],
  point2: number[],
  unit: string = 'meters',
): number {
  // console.log(point1, point2);

  const from = turf.point(point1)
  const to = turf.point(point2)
  const options: any = { units: unit }

  const distance = turf.distance(from, to, options)

  return distance
}

export function isPerformanceLow() {
  // // 检测WebGL
  // if (!Cesium.WebGL.isSupported()) {
  //   return true; // WebGL不支持
  // }

  // 检测设备性能
  if (window.navigator.gpu && window.navigator.gpu.subgroups) {
    // 如果设备支持并且subgroups性能较低，可以认为性能不足
    return window.navigator.gpu.subgroups === 'on-demand'
  }

  // 检测设备内存
  if (window.navigator.deviceMemory) {
    // 如果设备内存较低，可以认为性能不足
    return window.navigator.deviceMemory < 4
  }

  // 检测用户代理字符串
  const userAgent = window.navigator.userAgent
  if (/Android|iPhone|iPad|iPod/.test(userAgent)) {
    // 移动设备可能对性能有所限制
    return true
  }

  // 如果上述条件都不满足，可以认为性能应该足够
  return false
}

// // 使用示例
// if (isPerformanceLow()) {
//   console.log('电脑性能可能对Cesium应用程序低下');
// } else {
//   console.log('电脑性能看起来可以流畅运行Cesium应用程序');
// }

export function parseMapString(str: string) {
  if (!str) {
    return {}
  }
  let obj: any = {}
  try {
    obj = JSON.parse(str)
  } catch (error) {}

  return obj
}

export function objectToMapString(obj: Record<string, string>) {
  return JSON.stringify(obj)
  // return `{${Object.entries(obj)
  //   .map(([key, value]) => `${key}=${value}`)
  //   .join(',')}}`;
}

export function fieldHasValue(field: any) {
  return field !== null && field !== undefined
}

export type FieldValue = string | number | null | undefined
/**
 * 对信息字段进行格式化，并对值为空时进行了处理
 * @param config
 * @returns
 */
export function infoFieldFormatter(config: {
  /**
   * 要格式化的值，可以是单个值或数组。如果是数组，单个值会被格式化后拼接返回
   */
  value: FieldValue | FieldValue[]
  /**
   * 对 value 进行格式化展示的函数，如果是数组，则对每个值进行格式化
   * @param value
   * @returns 格式化后的字符串
   */
  valueFormatter?: (value: FieldValue) => string
  /**
   * 拼接在 value 后的单位，默认为空字符串
   */
  unit?: string
  /**
   * 值为空时的展示字符串，默认为 '-'
   */
  emptyString?: string
  /**
   * value 为数组，拼接时的分隔符，默认为 '，'
   */
  joinString?: string
}): string {
  const {
    value,
    valueFormatter,
    unit = '',
    emptyString = '-',
    joinString = ',',
  } = config
  if (Array.isArray(value)) {
    return value
      .map((v) =>
        infoFieldFormatter({
          value: v,
          unit,
          emptyString,
          valueFormatter,
          joinString,
        }),
      )
      .join(joinString)
  } else if (typeof value === 'string') {
    try {
      const v = JSON.parse(value as string)
      if (Array.isArray(v)) {
        return v
          .map((v) =>
            infoFieldFormatter({
              value: v.deviceName,
              unit,
              emptyString,
              valueFormatter,
              joinString,
            }),
          )
          .join(joinString)
      }
    } catch (error) {}
  }
  return fieldHasValue(value)
    ? `${valueFormatter ? valueFormatter(value) : value}${unit}`
    : emptyString
}
