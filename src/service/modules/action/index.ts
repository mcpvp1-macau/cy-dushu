import serverJingqi from '@/service/servers/serverJingqi'

/** 行动列表查询 */
export const getActionList = (data: API_ACTION.req.ActionListReq = {}) => {
  return serverJingqi.post<API_ACTION.res.ActionListRes>('/action/list', data)
}

/** 行动记录查询 */
export const getActionRecordList = (
  data: API_ACTION.req.ActionListReq = {},
) => {
  return serverJingqi.post<API_ACTION.res.ActionListRes>(
    '/action/record/list',
    data,
  )
}

/** 获取大行动任务信息 */
export const getAction = (params: { actionId?: number; eventId?: string }) => {
  return serverJingqi.get<API_ACTION.res.ActionDetailRes>('/action/get', {
    params,
  })
}

/** 添加行动 */
export const addAction = (data: any) => {
  return serverJingqi.post<{ actionId: number }>('/action/add', data)
}

/** 快捷创建行动及任务 */
export const fastAddAction = (data: API_ACTION.req.FastAddActionReq) => {
  return serverJingqi.post<API_ACTION.res.FastAddActionRes>(
    '/action/fastAdd',
    data,
  )
}

/** 结束行动 */
export const endAction = (actionId: number) => {
  return serverJingqi.get('/action/stop', {
    params: { actionId },
  })
}

/** 行动终止前检查 */
export const checkEndAction = (actionId: number) => {
  return serverJingqi.get('/action/stop/check', {
    params: { actionId },
  })
}

/** 更新行动 */
export const updAction = (data: any) => {
  return serverJingqi.post('/action/update', data)
}

/** 行动日志列表查询 */
export const getActionLogList = (data: any) => {
  return serverJingqi.post('/action/log/list', data)
}

/**
 * 检测结果列表接口
 * https://jingan.yuque.com/staff-ycgiyb/ctubtf/fdtx6mamqyexk82w#LgUtk
 */
export const getAIResultList = (data: {
  actionId: string
  actionItemId?: number
  actionRecordId?: number
}) => {
  return serverJingqi.post<API_ACTION.res.AIResultListRes>('/result/list', data)
}

/** (手动) 更新 AI 检测结果 */
export const updAIResult = (data: {
  id: number
  plateNo?: string
  plateColor?: string
  resultType?: string
  plateType?: string
  extra?: string
}) => {
  return serverJingqi.post('/result/update', data)
}

/** 事故照片检测结果删除 */
export const delAIResult = (actionId: string, ids: string[]) => {
  return serverJingqi.post('/result/delete', { actionId, ids })
}

/** 删除行动 */
export const deleteAction = (actionId: number) => {
  return serverJingqi.post(`/action/delete/${actionId}`)
}
