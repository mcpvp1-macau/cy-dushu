import serverJingqi from '@/service/servers/serverJingqi'

/** 行动子任务列表查询 */
export const getActionItemList = (
  data: API_ACTION_ITEM.req.ActionItemListReq,
) => {
  return serverJingqi.post<API_ACTION_ITEM.res.ActionItemListRes>(
    '/action/item/list',
    data,
  )
}

/** 开始子任务 */
export const startActionItem = (actionId: number) => {
  return serverJingqi.get('/action/item/start', {
    params: { actionItemIds: actionId },
  })
}

/** 暂停或继续子任务 */
export const pauseActionItem = (
  data: API_ACTION_ITEM.req.PauseActionItemReq,
) => {
  return serverJingqi.post('/action/item/pause', data)
}

/** 结束子任务 */
export const endActionItem = (actionId: number) => {
  return serverJingqi.get('/action/item/stop', {
    params: { actionItemId: actionId },
  })
}

/** 创建子行动 */
export const createActionItem = (data: any) => {
  return serverJingqi.post('/action/item/add', data)
}

/** 更新子行动 */
export const updateActionItem = (data: any) => {
  return serverJingqi.post('/action/item/update', data)
}
