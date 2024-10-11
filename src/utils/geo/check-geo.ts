import { out_of_china } from './coordtransform.js'

/** 校验坐标是否正确 */

export const checkGeo = (lng: any, lat: any) => {
  if (typeof lng === 'string') {
    lng = parseFloat(lng)
  }
  if (typeof lat === 'string') {
    lat = parseFloat(lat)
  }
  if (isNaN(lng) || isNaN(lat)) {
    return false
  }
  if (Math.abs(lng) < 1e-6 && Math.abs(lat) < 1e-6) {
    return false
  }

  if (out_of_china(lng, lat)) {
    return false
  }

  return true
}
