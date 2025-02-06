import serverJingqi from '@/service/servers/serverJingqi'

/** 分页获取计划列表 */
export const getActionPlanList = (data: any) => {
  return serverJingqi.post<API_ACTION_PLAN.res.GetPlanListRes>(
    '/action/plan/list',
    data,
  )
}

/** 添加计划 */
export const addActionPlan = (data: API_ACTION_PLAN.domain.Plan) => {
  return serverJingqi.post('/action/plan/add', data)
}

/** 更新计划 */
export const updateActionPlan = (data: API_ACTION_PLAN.domain.Plan) => {
  return serverJingqi.post('/action/plan/update', data)
}

/** 终止计划 */
export const terminateActionPlan = (actionPlanId: number) => {
  return serverJingqi.post(`/action/plan/terminate/${actionPlanId}`)
}

/** 停止计划 */
export const stopActionPlan = (actionPlanId: number) => {
  return serverJingqi.post(`/action/plan/stop/${actionPlanId}`)
}

/** 启动计划 */
export const startActionPlan = (actionPlanId: number) => {
  return serverJingqi.post(`/action/plan/start/${actionPlanId}`)
}

/** 删除计划 */
export const deleteActionPlan = (actionPlanId: number) => {
  return serverJingqi.post(`/action/plan/delete/${actionPlanId}`)
}

/** 获取计划记录列表 */
export const getActionPlanRecordList = (
  data: API_ACTION_PLAN.req.GetPlanRecordListReq,
) => {
  return serverJingqi.post<API_ACTION_PLAN.res.GetPlanRecordListRes>(
    '/action/plan/record/list',
    data,
  )
}
