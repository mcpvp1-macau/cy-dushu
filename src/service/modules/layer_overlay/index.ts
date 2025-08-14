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
export const getSpaceList = (data?: {
  spaceType: string
  isPage?: boolean
}) => {
  return serverJingqi.post<API_LAYER_OVERLAY.res.GetSpaceListRes>(
    '/space/list',
    data ?? {},
  )
}

/** 自定义地图 (瓦片) 详情 */
export const getSpaceDetail = (id: number) => {
  return serverJingqi.get<API_LAYER_OVERLAY.domain.SpaceItem>(
    '/space/getById',
    {
      params: { id },
    },
  )
}

/** 新建图层 */
export const addLayer = (data: API_LAYER_OVERLAY.req.AddLayerReq) => {
  return serverJingqi.post('/layer/create', data)
}

/** 新增地图 */
export const addSpace = (data: any) => {
  return serverJingqi.post('/space/add', data)
}

/** 删除地图 */
export const delSpace = (spaceId: number | string) => {
  return serverJingqi.get('/space/deleteById', {
    params: { id: spaceId },
  })
}

/** 更新地图 */
export const updSpace = (data: any) => {
  return serverJingqi.post('/space/update', data)
}

/** 删除图层 */
export const delLayer = (layerId: number) => {
  return serverJingqi.post('/layer/delete', { layerId })
}

export async function defence(overlayId: number) {
  return serverJingqi.post(`/overlay/defense`, {
    overlayIds: [overlayId],
  })
}

export async function undefence(overlayId: number) {
  return serverJingqi.post(`/overlay/undefense`, {
    overlayIds: [overlayId],
  })
}

export async function getDefenseOverlay(
  data: {
    overlayName?: string
    startTime?: string
    defenseStatus?: 1 | 0
    endTime?: string
  },
  options?: { [key: string]: any },
) {
  return serverJingqi.post(`/overlay/defense/list`, data, options)
}

export async function getDefenseOverlayHistory(data?: any) {
  return serverJingqi.post(`/overlay/defense/record/list`, data)
}
