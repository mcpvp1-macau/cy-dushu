import dayjs from 'dayjs'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEMO_ACTION_ITEMS,
  DEMO_ACTION_TYPE,
  DEMO_WAYLINE_TEMPLATES,
} from './constants'
import { TANQI_NATURAL_SCRIPT } from '@/components/Tanqi/demo/natural-script'
import { TanqiReport, TanqiReportType } from '@/components/Tanqi/demo/report-data'

export type DemoPageMode = 'standard' | 'full-flow'
type FullFlowPhase = 'phase1' | 'phase2'

export type FullFlowMessage = {
  key: string
  role: 'user' | 'ai'
  content?: string
  report?: TanqiReport
}

type StateType = {
  mode: DemoPageMode
  actions: API_ACTION.domain.ActionRecord[]
  actionItemsByActionId: Record<number, API_ACTION_ITEM.domain.ActionItem[]>
  reportCursorByActionId: Record<number, number>
  completedPhases: Record<FullFlowPhase, boolean>
  finalReportGenerated: boolean
  messagesByActionId: Record<number, FullFlowMessage[]>
  revealedWaylineTemplateIds: number[]
  nextActionId: number
}

type ActionsType = {
  setMode: (mode: DemoPageMode) => void
  resetFullFlow: () => void
  addAction: (data: {
    name: string
    type: string
    description?: string
  }) => API_ACTION.domain.ActionRecord
  updateAction: (data: Partial<API_ACTION.domain.ActionRecord> & { id: number }) => void
  startActionItems: (actionId: number, actionItemIds: number[]) => void
  appendMessage: (actionId: number, message: FullFlowMessage) => void
  createNextReport: (actionId: number) => TanqiReport | null
}

const REPORTS = TANQI_NATURAL_SCRIPT.filter((item) => item.role === 'ai' && item.report)
  .map((item) => item.report!)

const PHASE2_START_INDEX = REPORTS.findIndex((report) =>
  report.title.includes('C区域'),
)
const PHASE3_START_INDEX = REPORTS.findIndex((report) => report.type === 'evaluation')

const FULL_FLOW_REPORTS: Record<FullFlowPhase | 'phase3', TanqiReport[]> = {
  phase1: REPORTS.slice(0, PHASE2_START_INDEX),
  phase2: REPORTS.slice(PHASE2_START_INDEX, PHASE3_START_INDEX),
  phase3: REPORTS.slice(PHASE3_START_INDEX, PHASE3_START_INDEX + 1),
}

const ACTION_TYPE_PHASE_MAP: Record<string, FullFlowPhase | undefined> = {
  [DEMO_ACTION_TYPE.AREA_RECON_STRIKE]: 'phase1',
  [DEMO_ACTION_TYPE.REMOTE_RECON_GROUND_STRIKE]: 'phase2',
}

const REPORT_PREFIX: Record<TanqiReportType, string> = {
  task: 'RW',
  situation: 'TS',
  damage: 'HS',
  evaluation: 'PG',
  inventory: 'ZB',
}

const emptyState = (): StateType => ({
  mode: 'standard',
  actions: [],
  actionItemsByActionId: {},
  reportCursorByActionId: {},
  completedPhases: {
    phase1: false,
    phase2: false,
  },
  finalReportGenerated: false,
  messagesByActionId: {},
  revealedWaylineTemplateIds: [],
  nextActionId: 10001,
})

const cloneReport = (report: TanqiReport, index: number): TanqiReport => {
  const nextReport = JSON.parse(JSON.stringify(report)) as TanqiReport
  if (nextReport.reportNo && /日期|份数/.test(nextReport.reportNo)) {
    nextReport.reportNo = `${REPORT_PREFIX[nextReport.type]}-${dayjs().format(
      'YYYYMMDD',
    )}-${String(index).padStart(2, '0')}`
  }
  return nextReport
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

const resolveWaylineTemplateId = (report: TanqiReport) => {
  if (report.type !== 'task') return undefined

  const title = normalize(report.title)
  const area = normalize(getMetaValue(report, ['任务区域', '任务区域/目标']))
  const target = normalize(
    getMetaValue(report, ['任务类型/目标', '任务区域/目标', '任务类型']),
  )
  const deviceNames = normalize([...new Set(getColumnValues(report, ['装备名称']))].join('/'))

  if (target.includes('跟踪目标') || title.includes('CY-9A')) return 9107
  if (title.includes('C区域') || area.includes('C区域')) return 9106
  if (title.includes('机器狗') || deviceNames.includes('机器狗')) return 9105
  if (title.includes('二次')) return 9104
  if (title.includes('打击') || target.includes('A目标')) return 9103
  if (area.includes('机场区域')) return 9101
  if (area.includes('B区域') || area.includes('B区')) return 9102

  return undefined
}

const cloneActionItemsForReport = (
  actionId: number,
  waylineTemplateId: number,
  existingCount: number,
) => {
  const sourceActionId = waylineTemplateId >= 9106 ? 9002 : 9001
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return (DEMO_ACTION_ITEMS[sourceActionId] ?? [])
    .filter((item) => String(item.taskTplId) === String(waylineTemplateId))
    .map((item, index) => {
      const extra = item.extra ? JSON.parse(item.extra) : {}
      if (extra.actionItemGroupId) {
        extra.actionItemGroupId = `${extra.actionItemGroupId}-${actionId}`
      }
      return {
        ...item,
        id: actionId * 1000 + existingCount + index + 1,
        actionId,
        status: 'PENDING',
        gmtCreate: now,
        gmtModified: now,
        extra: JSON.stringify(extra),
      }
    })
}

const countGeneratedReports = (state: StateType, reportType: TanqiReportType) =>
  Object.values(state.messagesByActionId)
    .flat()
    .filter((message) => message.report?.type === reportType).length

export const useFullFlowDemoStore = create<StateType & ActionsType>()(
  persist(
    (set, get) => ({
    ...emptyState(),
    setMode: (mode) => set({ mode }),
    resetFullFlow: () => set({ ...emptyState(), mode: get().mode }),
    addAction: (data) => {
      const state = get()
      const id = state.nextActionId
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const record: API_ACTION.domain.ActionRecord = {
        id,
        actionId: id,
        name: data.name,
        status: 'PROCESSING',
        eventId: '',
        startTime: now,
        type: data.type,
        endTime: '',
        gmtCreate: now,
        gmtModified: now,
        gmtCreateBy: 'demo',
        gmtModifiedBy: 'demo',
        description: data.description ?? '',
      }
      set({
        actions: [record, ...state.actions],
        actionItemsByActionId: {
          ...state.actionItemsByActionId,
          [id]: [],
        },
        reportCursorByActionId: {
          ...state.reportCursorByActionId,
          [id]: 0,
        },
        messagesByActionId: {
          ...state.messagesByActionId,
          [id]: [],
        },
        nextActionId: id + 1,
      })
      return record
    },
    updateAction: (data) =>
      set((state) => ({
        actions: state.actions.map((item) =>
          item.id === data.id
            ? {
                ...item,
                ...data,
                gmtModified: dayjs().format('YYYY-MM-DD HH:mm:ss'),
              }
            : item,
        ),
      })),
    startActionItems: (actionId, actionItemIds) =>
      set((state) => {
        const actionItemIdSet = new Set(actionItemIds)
        return {
          actionItemsByActionId: {
            ...state.actionItemsByActionId,
            [actionId]: (state.actionItemsByActionId[actionId] ?? []).map(
              (item) =>
                actionItemIdSet.has(item.id)
                  ? {
                      ...item,
                      status: 'PROCESSING',
                      startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    }
                  : item,
            ),
          },
        }
      }),
    appendMessage: (actionId, message) =>
      set((state) => ({
        messagesByActionId: {
          ...state.messagesByActionId,
          [actionId]: [...(state.messagesByActionId[actionId] ?? []), message],
        },
      })),
    createNextReport: (actionId) => {
      const state = get()
      const action = state.actions.find((item) => item.id === actionId)
      if (!action) return null

      const phase = ACTION_TYPE_PHASE_MAP[action.type]
      if (!phase) return null

      const cursor = state.reportCursorByActionId[actionId] ?? 0
      const phaseReports = FULL_FLOW_REPORTS[phase]
      const bothActionPhasesCompleted =
        state.completedPhases.phase1 && state.completedPhases.phase2

      const rawReport =
        cursor < phaseReports.length
          ? phaseReports[cursor]
          : bothActionPhasesCompleted && !state.finalReportGenerated
            ? FULL_FLOW_REPORTS.phase3[0]
            : null

      if (!rawReport) return null

      const report = cloneReport(
        rawReport,
        countGeneratedReports(state, rawReport.type) + 1,
      )
      const waylineTemplateId = resolveWaylineTemplateId(report)
      const currentItems = state.actionItemsByActionId[actionId] ?? []
      const shouldCreateTask =
        waylineTemplateId != null &&
        !currentItems.some(
          (item) => String(item.taskTplId) === String(waylineTemplateId),
        )
      const nextItems = shouldCreateTask
        ? [
            ...currentItems,
            ...cloneActionItemsForReport(
              actionId,
              waylineTemplateId,
              currentItems.length,
            ),
          ]
        : currentItems

      const nextCompletedPhases = { ...state.completedPhases }
      if (cursor + 1 >= phaseReports.length) {
        nextCompletedPhases[phase] = true
      }

      set({
        actionItemsByActionId: {
          ...state.actionItemsByActionId,
          [actionId]: nextItems,
        },
        reportCursorByActionId: {
          ...state.reportCursorByActionId,
          [actionId]:
            cursor < phaseReports.length ? cursor + 1 : cursor,
        },
        completedPhases: nextCompletedPhases,
        finalReportGenerated:
          rawReport === FULL_FLOW_REPORTS.phase3[0] || state.finalReportGenerated,
        revealedWaylineTemplateIds:
          waylineTemplateId != null &&
          !state.revealedWaylineTemplateIds.includes(waylineTemplateId)
            ? [...state.revealedWaylineTemplateIds, waylineTemplateId]
            : state.revealedWaylineTemplateIds,
      })

      return report
    },
    }),
    {
      name: 'full-flow-demo',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export const isFullFlowDemoMode = () =>
  useFullFlowDemoStore.getState().mode === 'full-flow'

export const getFullFlowActionList = () => useFullFlowDemoStore.getState().actions

export const getFullFlowAction = (actionId?: number) =>
  useFullFlowDemoStore
    .getState()
    .actions.find((item) => item.id === Number(actionId))

export const getFullFlowActionItems = (actionId: number) =>
  useFullFlowDemoStore.getState().actionItemsByActionId[actionId] ?? []

export const startFullFlowActionItems = (
  actionId: number,
  actionItemIds: number[],
) => useFullFlowDemoStore.getState().startActionItems(actionId, actionItemIds)

export const getFullFlowWaylineTemplates = () => {
  const ids = useFullFlowDemoStore.getState().revealedWaylineTemplateIds
  return DEMO_WAYLINE_TEMPLATES.filter((item) =>
    ids.includes(item.waylineTemplateId),
  )
}

export const getFullFlowActionLabel = (type?: string) => {
  if (type === DEMO_ACTION_TYPE.AREA_RECON_STRIKE) return '环节一'
  if (type === DEMO_ACTION_TYPE.REMOTE_RECON_GROUND_STRIKE) return '环节二'
  return '演示'
}
