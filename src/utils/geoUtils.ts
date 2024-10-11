import { Cartesian3, Cartographic, Math as CMath } from 'cesium'

export const cartesian3ToDegrees = (cartesian: Cartesian3) => {
  const cartographic = Cartographic.fromCartesian(cartesian)
  const longitude = Number(CMath.toDegrees(cartographic.longitude).toFixed(6))
  const latitude = Number(CMath.toDegrees(cartographic.latitude).toFixed(6))
  return [longitude, latitude, cartographic.height]
}
