import serverJingqi from '@/service/servers/serverJingqi'

/** 查询工单暂存记录 */
export const getKCYPOrder = (data: API_KCYP.req.GetKCYPOrderReq) => {
  return serverJingqi.post<API_KCYP.res.GetKCYPOrderRes>('/kcyp/get', data)
}

/** 保存工单暂存记录 */
export const saveKCYPOrder = (data: API_KCYP.req.SaveKYCPOrderReq) => {
  return serverJingqi.post('/kcyp/save', data)
}

/** 最终工单提交 */
export const commitKYCPOrder = (data: {
  kcypActionCommit: any
  pictures: any
}) => {
  return serverJingqi.post<API_KCYP.res.CommitKCYPRes>('/kcyp/commit', data)
}
