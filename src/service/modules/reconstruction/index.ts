import serverJingqi from '@/service/servers/serverJingqi'

/**获取三维图分组列表 */
export const getLayerGroupList = () => {
  return serverJingqi.get<API_RECONSTRUCTION.res.LayerGroupList>(
    '/reconstruction/layer/list',
  )
}

/**创建三维图分组列表 */
export const createLayerGroupList = (layerName: string) => {
  return serverJingqi.post<{
    layerId: number
    layerUuid: number
  }>('/reconstruction/layer/create', { layerName })
}

/**删除三维图分组列表 */
export const deleteLayerGroupList = (layerId: number) => {
  return serverJingqi.post('/reconstruction/layer/delete', { layerId })
}

/**获取三维图列表 */
export const getLayerList = (data: API_RECONSTRUCTION.req.GetLayerList) => {
  return serverJingqi.post<API_RECONSTRUCTION.res.LayerList>(
    '/reconstruction/overlay/list',
    data,
  )
}

/**创建三维图层 */
export const createLayer = (data: API_RECONSTRUCTION.req.CreateLayer) => {
  return serverJingqi.post<{
    overlayId: number
    overlayUuid: string
  }>('/reconstruction/overlay/create', data)
}

/**修改三维图层的名称 */
export const updateLayer = (data: API_RECONSTRUCTION.req.UpdateLayer) => {
  return serverJingqi.post('/reconstruction/overlay/update', data)
}

/**删除三维图层 */
export const deleteLayer = (overlayId: number) => {
  return serverJingqi.post('/reconstruction/overlay/delete', { overlayId })
}

/**创建并执行三维建图任务 */
export const startReconstructionTask = (
  data: API_RECONSTRUCTION.req.StartTask,
) => {
  return serverJingqi.post<number>('/reconstruction/task/start', data)
}

/**执行三维重建 */
export const startBuild = (data: API_RECONSTRUCTION.req.StartBuild) => {
  return serverJingqi.post<API_RECONSTRUCTION.res.BuildResult>(
    '/reconstruction/task/startBuild',
    data,
  )
}
