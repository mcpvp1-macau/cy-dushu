import { DEMO_ACTION_ITEMS } from '@/demo/situation/constants'
import {
  getFullFlowActionItems,
  isFullFlowDemoMode,
  isSeatDemoMode,
} from '@/demo/situation/full-flow-demo.store'
import { getSeatDemoActionItems } from '@/demo/situation/seat-demo.store'
import serverJingqi from '@/service/servers/serverJingqi'

/** 演示模式统一响应包装 */
const demoResp = <T>(
  data: T,
): Promise<{ code: string; message: string; data: T }> =>
  Promise.resolve({ code: 'SUCCESS', message: 'demo', data })

/** 行动子任务列表查询 */
export const getActionItemList = (
  data: API_ACTION_ITEM.req.ActionItemListReq,
) => {
  if (globalConfig.demoMode) {
    const actionId = Number(data.actionId)
    const items = isFullFlowDemoMode()
      ? getFullFlowActionItems(actionId)
      : isSeatDemoMode()
        ? getSeatDemoActionItems(actionId)
      : (DEMO_ACTION_ITEMS[actionId] ?? [])
    return demoResp<API_ACTION_ITEM.res.ActionItemListRes>({
      rows: items,
      total: items.length,
    })
  }
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

/** 获取设备最新子任务 */
export const getDeviceLatestActionItem = (deviceId: string) => {
  return serverJingqi.get<API_ACTION_ITEM.domain.ActionItemDetail>(
    `/action/item/device/latest/${deviceId}`,
    {
      xCustomConfig: {
        autoShowMessageOnNotSuccess: false,
      },
    },
  )
}

/** 创建子行动 */
export const createActionItem = (
  data: any,
  autoShowMessageOnNotSuccess = true,
) => {
  return serverJingqi.post<API_ACTION_ITEM.res.AddActionItemRes>(
    '/action/item/add',
    data,
    {
      xCustomConfig: {
        autoShowMessageOnNotSuccess,
      },
    },
  )
}

/** 更新子行动 */
export const updateActionItem = (data: any) => {
  return serverJingqi.post('/action/item/update', data)
}

/** 获取飞手树 */
export const getPilotTree = () => {
  return serverJingqi.get<API_ACTION_ITEM.res.GetPilotTreeRes>(
    '/jinghang/pilots',
  )
}
