import {
  DEMO_ACTION_ITEMS,
  DEMO_ACTIONS,
  DEMO_WAYLINE_TEMPLATES,
} from '@/demo/situation/constants'
import { formatWaylineDisplayName } from '@/utils/wayline'
import { TanqiReport } from './report-data'

export type TanqiTaskExecutionPreset = {
  actionId: number
  actionName: string
  actionItemName: string
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
}

const ACTION_STATUS_TEXT: Record<string, string> = {
  PENDING: '待执行',
  PROCESSING: '进行中',
  PAUSED: '暂停',
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

const resolveActionId = (report: TanqiReport) => {
  if (report.type !== 'task') return undefined

  const title = normalize(report.title)
  const area = normalize(getMetaValue(report, ['任务区域', '任务区域/目标']))
  const target = normalize(getMetaValue(report, ['任务类型/目标', '任务区域/目标']))

  if (title.includes('CY-9A')) return 9007
  if (title.includes('C区域')) return 9006
  if (title.includes('机器狗')) return 9005
  if (title.includes('二次')) return 9004
  if (title.includes('打击')) return 9003
  if (area.includes('机场区域')) return 9001
  if (area.includes('B区域') || area.includes('B区')) return 9002
  if (target.includes('侦察任务') && area.includes('B')) return 9002

  return undefined
}

/** 将 RW 任务规划报告映射到演示行动库中的预设行动信息。 */
export const getTanqiTaskExecutionPreset = (
  report: TanqiReport,
): TanqiTaskExecutionPreset | null => {
  const actionId = resolveActionId(report)
  if (!actionId) return null

  const action = DEMO_ACTIONS.find((item) => item.actionId === actionId)
  const actionItems = DEMO_ACTION_ITEMS[actionId] ?? []
  const actionItem = actionItems[0]
  if (!action || !actionItem) return null

  const wayline = DEMO_WAYLINE_TEMPLATES.find(
    (item) =>
      item.templateId === actionItem.templateId ||
      String(item.waylineTemplateId) === String(actionItem.taskTplId),
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
  }>(actionItem.extra)
  const isGroupedAction = Boolean(groupMeta?.actionItemGroupId)
  const actionDeviceName = isGroupedAction
    ? uniqueText(actionItems.map((item) => item.deviceName ?? '').filter(Boolean))
    : actionItem.deviceName
  const actionDeviceId = isGroupedAction ? '' : actionItem.deviceId

  return {
    actionId,
    actionName: action.name,
    actionItemName:
      groupMeta?.actionItemGroupName || actionItem.actionItemName || report.title,
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
  }
}
