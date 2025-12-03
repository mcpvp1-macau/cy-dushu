import serverDushu from '@/service/servers/serverDushu'

export const addDeviceTag = (data: {
  deviceId: string
  productKey: string
  key: string
  name: string
  value: string
}) => {
  return serverDushu.post('/mobileDevice/manage/device/tag/add', data)
}

export const updateDeviceTag = (data: {
  deviceId: string
  productKey: string
  key: string
  name: string
  value: string
}) => {
  return serverDushu.post('/mobileDevice/manage/device/tag/update', data)
}
