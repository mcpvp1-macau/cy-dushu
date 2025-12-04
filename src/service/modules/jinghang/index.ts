import serverJingqi from '@/service/servers/serverJingqi'

export type CheckDeviceCanFlyReq = {
  deviceId: string
}

export type CheckDeviceCanFlyResp = {
  /** 报备的飞行高度 */
  flightAltitude?: number
  isCanFly: boolean
  reason: string
  /** 报备的返航高度 */
  returnAltitude: number
}

/** 查看是否能够起飞 */
export const checkDeviceCanFly = (data: CheckDeviceCanFlyReq) => {
  return serverJingqi.post<CheckDeviceCanFlyResp>(
    '/jinghang/device/actionItem',
    data,
  )
}
