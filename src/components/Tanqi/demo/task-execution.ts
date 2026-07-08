import {
  DEMO_ACTION_ITEMS,
  DEMO_ACTIONS,
  DEMO_WAYLINE_TEMPLATES,
} from '@/demo/situation/constants'
import {
  getFullFlowAction,
  getFullFlowPreparedActionItems,
  isFullFlowDemoMode,
} from '@/demo/situation/full-flow-demo.store'
import { formatWaylineDisplayName } from '@/utils/wayline'
import { TanqiReport } from './report-data'

export type TanqiTaskExecutionPreset = {
  actionId: number
  waylineTemplateId: number
  actionName: string
  actionItemId?: number
  actionItemName: string
  isGrouped?: boolean
  reportTitle: string
  reportNo?: string
  taskTarget?: string
  taskArea?: string
  deviceId?: string
  deviceName: string
  waylineName: string
  waylineType?: string
  waypointCount?: number
  waylineSummary?: string
  flightHeight?: number | string
  returnHeight?: number | string
  speed?: string
  status: string
  timing?: string
  childTasks?: TanqiTaskExecutionChildTask[]
}

export type TanqiTaskExecutionChildTask = {
  actionItemId: number
  actionItemName: string
  deviceId?: string
  deviceName?: string
  waylineName: string
  flightHeight?: number | string
  returnHeight?: number | string
  status: string
}

const ACTION_STATUS_TEXT: Record<string, string> = {
  PENDING: '待执行',
  PROCESSING: '进行中',
  PAUSED: '暂停',
  PAUSE: '暂停',
  FINISHED: '已完成',
  FINISH: '已完成',
}

const normalize = (value?: string) => value?.replace(/\s+/g, '') ?? ''

const getMetaValue = (report: TanqiReport, labels: string[]) =>
  report.meta?.find(([key]) => labels.some((label) => key.includes(label)))?.[1]

const getColumnValues = (report: TanqiReport, labels: string[]) => {
  const table = report.tables?.find((item) => item.rows.length)
  if (!table) return []

  const columnIndex = table.headers.findIndex((header) =>
    labels.some((label) => header.includes(label)),
  )
  if (columnIndex < 0) return []

  return table.rows.map((row) => row[columnIndex]).filter(Boolean)
}

const uniqueText = (values: string[]) => [...new Set(values)].join(' / ')

const parseJson = <T>(value?: string | null): T | undefined => {
  if (!value) return undefined
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

const getWaypointCount = (wayline?: API_AIRLINE.domain.AIRLINE_TEMPLATE) => {
  const parameters = parseJson<{
    spaces?: {
      positions?: unknown[]
    }[]
  }>(wayline?.parameters)

  return parameters?.spaces?.reduce(
    (count, space) =>
      count + (Array.isArray(space.positions) ? space.positions.length : 0),
    0,
  )
}

type ResolvedTaskTarget = {
  actionId: number
  waylineTemplateId: number
}

const resolveTaskTarget = (report: TanqiReport): ResolvedTaskTarget | null => {
  if (report.type !== 'task') return null

  const title = normalize(report.title)
  const area = normalize(getMetaValue(report, ['任务区域', '任务区域/目标']))
  const target = normalize(
    getMetaValue(report, ['任务类型/目标', '任务区域/目标', '任务类型']),
  )
  const deviceNames = normalize(uniqueText(getColumnValues(report, ['装备名称'])))

  if (target.includes('跟踪目标') || title.includes('CY-9A')) {
    return { actionId: 9002, waylineTemplateId: 9107 }
  }

  if (title.includes('C区域') || area.includes('C区域')) {
    return { actionId: 9002, waylineTemplateId: 9106 }
  }

  if (title.includes('机器狗') || deviceNames.includes('机器狗')) {
    return { actionId: 9001, waylineTemplateId: 9105 }
  }

  if (title.includes('二次')) {
    return { actionId: 9001, waylineTemplateId: 9104 }
  }

  if (title.includes('打击') || target.includes('A目标')) {
    return { actionId: 9001, waylineTemplateId: 9103 }
  }

  if (area.includes('机场区域')) {
    return { actionId: 9001, waylineTemplateId: 9101 }
  }

  if (
    area.includes('B区域') ||
    area.includes('B区') ||
    (target.includes('侦察任务') && area.includes('B'))
  ) {
    return { actionId: 9001, waylineTemplateId: 9102 }
  }

  return null
}

/** 将 RW 任务规划报告映射到演示行动库中的预设行动信息。 */
export const getTanqiTaskExecutionPreset = (
  report: TanqiReport,
  currentActionId?: number,
): TanqiTaskExecutionPreset | null => {
  const resolvedTask = resolveTaskTarget(report)
  if (!resolvedTask) return null
  const { waylineTemplateId } = resolvedTask
  const actionId =
    currentActionId && isFullFlowDemoMode()
      ? currentActionId
      : resolvedTask.actionId

  const action =
    currentActionId && isFullFlowDemoMode()
      ? getFullFlowAction(currentActionId)
      : DEMO_ACTIONS.find((item) => item.actionId === actionId)
  const sourceActionItems =
    currentActionId && isFullFlowDemoMode()
      ? getFullFlowPreparedActionItems(currentActionId, waylineTemplateId)
      : (DEMO_ACTION_ITEMS[actionId] ?? [])
  const actionItems = sourceActionItems.filter(
    (item) => String(item.taskTplId) === String(waylineTemplateId),
  )
  const actionItem = actionItems[0]
  if (!action || !actionItem) return null

  const wayline = DEMO_WAYLINE_TEMPLATES.find(
    (item) =>
      item.templateId === actionItem.templateId ||
      item.waylineTemplateId === waylineTemplateId,
  )
  const taskBasic = parseJson<{ globalTransitionalSpeed?: number | string }>(
    wayline?.taskBasic,
  )
  const waypointCount = getWaypointCount(wayline)

  const taskTarget = getMetaValue(report, ['任务类型/目标', '任务区域/目标', '任务类型'])
  const taskArea = getMetaValue(report, ['任务区域', '任务区域/目标'])
  const speedFromReport = uniqueText(getColumnValues(report, ['飞行速度']))
  const timing = uniqueText(getColumnValues(report, ['作战时序', '时序']))
  const groupMeta = parseJson<{
    actionItemGroupId?: string
    actionItemGroupName?: string
    swarmIndex?: number
  }>(actionItem.extra)
  const isGroupedAction = Boolean(groupMeta?.actionItemGroupId)
  const groupedActionItems = isGroupedAction
    ? [...actionItems].sort((prev, next) => {
        const prevIndex =
          parseJson<{ swarmIndex?: number }>(prev.extra)?.swarmIndex ?? 0
        const nextIndex =
          parseJson<{ swarmIndex?: number }>(next.extra)?.swarmIndex ?? 0
        return prevIndex - nextIndex
      })
    : []
  const actionDeviceName = isGroupedAction
    ? uniqueText(
        groupedActionItems.map((item) => item.deviceName ?? '').filter(Boolean),
      )
    : actionItem.deviceName
  const actionDeviceId = isGroupedAction ? '' : actionItem.deviceId
  const childTasks = isGroupedAction
    ? groupedActionItems.map((item) => ({
        actionItemId: item.id,
        actionItemName: item.actionItemName || '-',
        deviceId: item.deviceId,
        deviceName: item.deviceName,
        waylineName: formatWaylineDisplayName(wayline),
        flightHeight: item.flightHeight,
        returnHeight: item.returnHeight,
        status: ACTION_STATUS_TEXT[item.status!] ?? item.status ?? '-',
      }))
    : undefined

  return {
    actionId,
    waylineTemplateId,
    actionName: action.name,
    actionItemId: actionItem.id,
    actionItemName:
      groupMeta?.actionItemGroupName || actionItem.actionItemName || report.title,
    isGrouped: isGroupedAction,
    reportTitle: report.title,
    reportNo: report.reportNo,
    taskTarget,
    taskArea,
    deviceId: actionDeviceId ?? '',
    deviceName:
      actionDeviceName || uniqueText(getColumnValues(report, ['装备名称'])),
    waylineName: formatWaylineDisplayName(wayline),
    waylineType: wayline?.taskType,
    waypointCount,
    waylineSummary: waypointCount ? `${waypointCount} 个航点` : undefined,
    flightHeight: actionItem.flightHeight,
    returnHeight: actionItem.returnHeight,
    speed: speedFromReport || `${taskBasic?.globalTransitionalSpeed ?? '-'}m/s`,
    status: ACTION_STATUS_TEXT[action.status] ?? action.status,
    timing,
    childTasks,
  }
}
