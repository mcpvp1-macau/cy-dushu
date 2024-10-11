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
export const getAction = (params: { actionId?: string; eventId?: string }) => {
  return serverJingqi.get<API_ACTION.res.ActionDetailRes>('/action/get', {
    params,
  })
}

/** 添加行动 */
export const addAction = (data: any) => {
  return serverJingqi.post('/action/add', data)
}

/** 结束行动 */
export const endAction = (actionId: string) => {
  return serverJingqi.get('/action/stop', {
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
}) => {
  return serverJingqi.post('/result/update', data)
}
