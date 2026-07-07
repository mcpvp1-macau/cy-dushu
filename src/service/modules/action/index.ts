import { DEMO_ACTIONS } from '@/demo/situation/constants'
import serverJingqi from '@/service/servers/serverJingqi'

/** 演示模式统一响应包装 */
const demoResp = <T>(
  data: T,
): Promise<{ code: string; message: string; data: T }> =>
  Promise.resolve({ code: 'SUCCESS', message: 'demo', data })

/** 行动列表查询 */
export const getActionList = (data: API_ACTION.req.ActionListReq = {}) => {
  if (globalConfig.demoMode) {
    const rows = DEMO_ACTIONS.filter(
      (e) =>
        (!data.name || e.name.includes(data.name)) &&
        (!data.status?.length || data.status.includes(e.status)),
    )
    return demoResp<API_ACTION.res.ActionListRes>({ rows, total: rows.length })
  }
  return serverJingqi.post<API_ACTION.res.ActionListRes>('/action/list', data)
}

/** 行动记录查询 */
export const getActionRecordList = (
  data: API_ACTION.req.ActionListReq = {},
) => {
  if (globalConfig.demoMode) {
    return demoResp<API_ACTION.res.ActionListRes>({ rows: [], total: 0 })
  }
  return serverJingqi.post<API_ACTION.res.ActionListRes>(
    '/action/record/list',
    data,
  )
}

/** 获取大行动任务信息 */
export const getAction = (params: { actionId?: number; eventId?: string }) => {
  if (globalConfig.demoMode) {
    const record =
      DEMO_ACTIONS.find((e) => e.id === Number(params.actionId)) ??
      DEMO_ACTIONS[0]
    return demoResp<API_ACTION.res.ActionDetailRes>({
      id: record.id,
      name: record.name,
      description: record.description,
      eventId: null,
      type: 'normal',
      status: record.status,
      isValid: true,
      gmtCreate: record.gmtCreate,
      gmtModified: record.gmtModified,
      gmtCreateBy: record.gmtCreateBy,
      gmtModifiedBy: record.gmtModifiedBy,
      actionRecordId: null,
      userList: [],
    } as API_ACTION.res.ActionDetailRes)
  }
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
  if (globalConfig.demoMode) {
    return demoResp({ rows: [], total: 0 })
  }
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
  if (globalConfig.demoMode) {
    return demoResp<API_ACTION.res.AIResultListRes>({ rows: [], total: 0 })
  }
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
