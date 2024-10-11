import serverJingqi from '@/service/servers/serverJingqi'
import serverPOI from '@/service/servers/serverPOI'

/** 获取图层列表 */
export const getLayerList = (data: any = {}) => {
  return serverJingqi.post<API_LAYER_OVERLAY.res.GetLayerListRes>(
    '/layer/list',
    data,
  )
}

/** 获取图层覆盖物 */
export const getOverlayList = (data: { layerIds: number[] }) => {
  return serverJingqi.post('/overlay/list', data)
}

/** 搜索 POI 数据 */
export const searchPOI = (params: {
  query: string
  start: number
  limit: number
}) => {
  return serverPOI.get<API_LAYER_OVERLAY.res.GetPOIListRes>('/poi/search', {
    params,
  })
}

/** 创建覆盖物 */
export const createOverlay = (data: any) => {
  return serverJingqi.post('/overlay/create', data)
}

/** 更新覆盖物 */
export const updateOverlay = (data: API_LAYER_OVERLAY.req.UpdateOverlayReq) => {
  return serverJingqi.post('/overlay/modify', data)
}

/** 删除覆盖物 */
export const deleteOverlaies = (overlayIds: number[]) => {
  return serverJingqi.post('/overlay/delete', { overlayIds })
}

/** 自定义地图 (瓦片) 列表 */
export const getSpaceList = () => {
  return serverJingqi.post<API_LAYER_OVERLAY.res.GetSpaceListRes>(
    '/space/list',
    {},
  )
}
