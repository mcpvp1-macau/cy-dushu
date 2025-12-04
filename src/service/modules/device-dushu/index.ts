import serverControlCenter from '@/service/servers/serverControlCenter'

export const addDeviceTag = (data: {
  deviceId: string
  productKey: string
  key: string
  name: string
  value: string
}) => {
  return serverControlCenter.post('/manage/device/tag/add', data)
}

export const updateDeviceTag = (data: {
  deviceId: string
  productKey: string
  key: string
  name: string
  value: string
}) => {
  return serverControlCenter.post('/manage/device/tag/update', data)
}
