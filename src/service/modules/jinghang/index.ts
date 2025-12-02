import serverJingqi from '@/service/servers/serverJingqi'

export type CheckDeviceCanFlyReq = {
  deviceId: string
}

export type CheckDeviceCanFlyResp = {
  isCanFly: boolean
  reason: string
}

/** 查看是否能够起飞 */
export const checkDeviceCanFly = (data: CheckDeviceCanFlyReq) => {
  return serverJingqi.post<CheckDeviceCanFlyResp>(
    '/jinghang/device/actionItem',
    data,
  )
}
