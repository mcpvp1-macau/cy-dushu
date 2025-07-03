import serverJingqi from '@/service/servers/serverJingqi'

/* 
tip：
	飞行区域衍生于覆盖物，返回的数据与覆盖物完全一致，但是飞行区域基于组织管理
	同一个组织下的成员飞行区域都基本一致，并且都拥有管理权限，但是该组织的下辖组织无权限管理，并且固定显示在地图上
	在创建分组与修改分组的时候需要带上权限 
*/

/** 获取飞行区域分组 */
export const getFlightAreaGroupList = (data: any = {}) => {
  return serverJingqi.post<API_FLIGHT_AREA.res.getFlightAreaGroupList>(
    '/zone/layer/list',
    data,
  )
}

/** 新建飞行区域分组 */
export const addFlightAreaGroup = (data: API_FLIGHT_AREA.req.AddLayerReq) => {
  return serverJingqi.post('/zone/layer/create', data)
}

/** 编辑飞行区域分组 */
export const updateFlightAreaGroup = (
  data: API_FLIGHT_AREA.req.UpdateLayerReq,
) => {
  return serverJingqi.post('/zone/layer/modify', data)
}

/** 删除飞行区域分组 */
export const deleteFlightAreaGroup = (layerId: number) => {
  return serverJingqi.post('/zone/layer/delete', { layerId })
}

/** 获取分组下的飞行区域列表 */
export const getFlightAreaList = (data: { layerIds: number[] }) => {
  return serverJingqi.post<API_FLIGHT_AREA.res.getFlightAreaList>(
    '/zone/overlay/list',
    data,
  )
}

/** 创建飞行区域 */
export const createFlightArea = (data: any) => {
  return serverJingqi.post('/zone/overlay/create', data)
}

/** 更新飞行区域 */
export const updateFlightArea = (
  data: API_LAYER_OVERLAY.req.UpdateOverlayReq,
) => {
  return serverJingqi.post('/zone/overlay/modify', data)
}

/** 删除飞行区域 */
export const deleteFlightArea = (overlayIds: number[]) => {
  return serverJingqi.post('/zone/overlay/delete', { overlayIds })
}
