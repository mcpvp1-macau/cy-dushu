import serverControlCenter from '@/service/servers/serverControlCenter'

/** 获取航线模板库列表 */
export const getAirlineTemplateList = (data: any) => {
  return serverControlCenter.post<API_AIRLINE.res.GetAirlineTemplateListRes>(
    '/v3/dji/waylines/task/template/list',
    data,
  )
}

/** @deprecated */
export const getAirlineTemplateDetail = (waylineTemplateId: string) => {
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
export const delAirlineTempalte = (waylineTemplateId: number) => {
  return serverControlCenter.post<undefined>(
    `/v3/dji/waylines/task/template/delete`,
    {
      waylineTemplateId,
    },
  )
}
