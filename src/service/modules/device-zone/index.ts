import serverJingqi from '@/service/servers/serverJingqi'

/** 设备覆盖物列表 */
export const getDeviceOverlay = () => {
  return serverJingqi.get<API_DEVICE_OVERLAY.res.ListOverlayConditionResponse>(
    '/zone/device/overlay/list',
  )
}

/* 创建设备覆盖物 */
export const createDeviceOverlay = (
  data: API_DEVICE_OVERLAY.req.CreateOverlayRequest,
) => {
  return serverJingqi.post<API_DEVICE_OVERLAY.req.CreateOverlayRequest>(
    '/zone/device/overlay/create',
    data,
  )
}

/** 删除设备覆盖物 */
export const deleteDeviceOverlay = (overlayIds: number[]) => {
  return serverJingqi.post<void>('/zone/device/overlay/delete', {
    overlayIds,
  })
}

/** 更新设备覆盖物 */
export const updateDeviceOverlay = (data: any) => {
  return serverJingqi.post('/zone/device/overlay/modify', data)
}
