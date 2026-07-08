import {
  DEMO_WAYLINE_FOLDERS,
  DEMO_WAYLINE_TEMPLATES,
} from '@/demo/situation/constants'
import {
  getFullFlowWaylineTemplates,
  isFullFlowDemoMode,
} from '@/demo/situation/full-flow-demo.store'
import serverControlCenter from '@/service/servers/serverControlCenter'

/** 演示模式统一响应包装 */
const demoResp = <T>(data: T): Promise<{ data: T } & Record<string, any>> =>
  Promise.resolve({ code: 'SUCCESS', message: 'demo', data })

/** 获取航线模板库列表 */
export const getWaylineTemplateList = (
  data: API_AIRLINE.req.ListFlightTaskTemplateRequest,
) => {
  if (globalConfig.demoMode) {
    const sourceRows = isFullFlowDemoMode()
      ? getFullFlowWaylineTemplates()
      : DEMO_WAYLINE_TEMPLATES
    const rows = sourceRows.filter(
      (e) =>
        (data.waylineTemplateId == null ||
          String(e.waylineTemplateId) === String(data.waylineTemplateId)) &&
        (!data.templateId || e.templateId === data.templateId) &&
        (!data.templateName || e.taskName.includes(data.templateName)) &&
        (!data.taskType || data.taskType.split(',').includes(e.taskType)),
    )
    return demoResp<API_AIRLINE.res.GetWaylineTemplateListRes>({
      rows,
      total: rows.length,
    } as API_AIRLINE.res.GetWaylineTemplateListRes)
  }
  return serverControlCenter.post<API_AIRLINE.res.GetWaylineTemplateListRes>(
    '/v3/dji/waylines/task/template/list',
    data,
  )
}

/** @deprecated */
export const getWaylineTemplateDetail = (waylineTemplateId: string) => {
  return serverControlCenter.post('/v3/dji/waylines/task/template/info', {
    templateId: waylineTemplateId,
  })
}

/** 获取设备和相机 */
export const getWaylineTaskModel = () => {
  return serverControlCenter.get<API_AIRLINE.res.getWaylineTaskModelRes>(
    '/v3/dji/waylines/task/model/get',
  )
}

/** 获取相机 */
export const getCameraByType = (cameraType: string) => {
  return serverControlCenter.get('/v3/dji/waylines/task/camera/get', {
    params: { cameraType },
  })
}

/** 删除航线模板 */
export const delWaylineTemplate = (waylineTemplateId: number) => {
  return serverControlCenter.post<undefined>(
    `/v3/dji/waylines/task/template/delete`,
    {
      waylineTemplateId,
    },
  )
}

/** 获取设备最新的任务 */
export const getLatestTask = (deviceId: string) => {
  return serverControlCenter.get(`/v3/latest/task/${deviceId}`, {
    xCustomConfig: {
      autoShowMessageOnNotSuccess: false,
    },
  })
}

/** 上传航线模板 */
export const uploadWaylineTemplate = (
  deviceId: string,
  productKey: string,
  file: File,
  isThird?: boolean,
  folderId?: string,
) => {
  const formData = new FormData()
  formData.append('deviceId', deviceId)
  formData.append('productKey', productKey)
  formData.append('file', file)
  formData.append('isThird', isThird ? 'true' : 'false')
  // 如果有 folderId 则附带上
  if (folderId) {
    formData.append('folderId', folderId)
  }
  return serverControlCenter.post(
    '/v3/dji/waylines/task/template/upload',
    formData,
  )
}

/** 创建航线文件夹 */
export const createWaylineFolder = (
  data: API_AIRLINE.req.CreateWaylineFolderRequest,
) => {
  return serverControlCenter.post<API_AIRLINE.res.CreateWaylineFolderResponse>(
    '/v3/dji/waylines/task/folder/create',
    data,
  )
}

/** 查询航线文件夹列表 */
export const listWaylineFolder = (
  data: API_AIRLINE.req.ListWaylineFolderRequest,
) => {
  if (globalConfig.demoMode) {
    return demoResp<API_AIRLINE.res.ListWaylineFolderResponse>(
      DEMO_WAYLINE_FOLDERS,
    )
  }
  return serverControlCenter.post<API_AIRLINE.res.ListWaylineFolderResponse>(
    '/v3/dji/waylines/task/folder/list',
    data,
  )
}

/** 删除航线文件夹 */
export const deleteWaylineFolder = (
  data: API_AIRLINE.req.DeleteWaylineFolderRequest,
) => {
  return serverControlCenter.post<undefined>(
    '/v3/dji/waylines/task/folder/delete',
    data,
  )
}

/** 更新航线文件夹 */
export const updateWaylineFolder = (
  data: API_AIRLINE.req.UpdateWaylineFolderRequest,
) => {
  return serverControlCenter.post<undefined>(
    '/v3/dji/waylines/task/folder/update',
    data,
  )
}

/** 批量更新航线文件夹父级 */
export const batchUpdateWaylineFolderParent = (
  data: API_AIRLINE.req.BatchUpdateWaylineFolderParentRequest,
) => {
  return serverControlCenter.post<undefined>(
    '/v3/dji/waylines/task/folder/update-parent/batch',
    data,
  )
}
