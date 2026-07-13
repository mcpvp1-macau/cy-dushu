import dayjs from 'dayjs'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEMO_ACTION_ITEMS,
  DEMO_ACTION_TYPE,
  DEMO_WAYLINE_TEMPLATES,
} from './constants'
import {
  appendUniqueNumber,
  getNextSeatReport,
  getReportsForSeat,
  getSeatReportCursorKey,
  type SeatDemoSeat,
} from './seat-demo.logic'
import { TANQI_NATURAL_SCRIPT } from '@/components/Tanqi/demo/natural-script'
import type { TanqiReport, TanqiReportType } from '@/components/Tanqi/demo/report-data'

export type SeatDemoMessage = {
  key: string
  role: 'user' | 'ai'
  content?: string
  report?: TanqiReport
}

export type SeatDemoAccount = {
  seat: SeatDemoSeat
  label: string
  defaultPath: string
  canUseTanqi: boolean
}

type SeatDemoPhase = 'phase1' | 'phase2'

type StateType = {
  seat: SeatDemoSeat
  activeActionId: number | null
  actions: API_ACTION.domain.ActionRecord[]
  reportCursorByActionAndSeat: Record<string, number>
  completedCommandPhases: Record<SeatDemoPhase, boolean>
  finalReportGenerated: boolean
  messagesByActionAndSeat: Record<string, SeatDemoMessage[]>
  actionItemsByActionId: Record<number, API_ACTION_ITEM.domain.ActionItem[]>
  revealedWaylineTemplateIds: number[]
  nextActionId: number
}

type ActionsType = {
  resetSeatDemo: () => void
  setSeat: (seat: SeatDemoSeat) => void
  setActiveActionId: (actionId: number) => void
  addAction: (data: {
    name: string
    type: string
    description?: string
  }) => API_ACTION.domain.ActionRecord
  appendMessage: (
    actionId: number,
    seat: SeatDemoSeat,
    message: SeatDemoMessage,
  ) => void
  createNextReport: (actionId: number, seat: SeatDemoSeat) => TanqiReport | null
  dispatchReportTask: (actionId: number, waylineTemplateId: number) => number[]
}

export const SEAT_DEMO_ACCOUNTS: SeatDemoAccount[] = [
  {
    seat: 'command',
    label: '指挥决策席',
    defaultPath: '/action',
    canUseTanqi: true,
  },
  {
    seat: 'planning',
    label: '任务规划席',
    defaultPath: '/wayline',
    canUseTanqi: false,
  },
  {
    seat: 'intelligence',
    label: '情报处理席',
    defaultPath: '/situation/events',
    canUseTanqi: true,
  },
  {
    seat: 'management',
    label: '综合管理席',
    defaultPath: '/sources?type=UAV',
    canUseTanqi: false,
  },
  {
    seat: 'display',
    label: '综合显示席',
    defaultPath: '/source/UAV',
    canUseTanqi: false,
  },
]

const REPORT_PREFIX: Record<TanqiReportType, string> = {
  task: 'RW',
  situation: 'TS',
  damage: 'HS',
  evaluation: 'PG',
  inventory: 'ZB',
}

const REPORTS = TANQI_NATURAL_SCRIPT.filter((item) => item.role === 'ai' && item.report)
  .map((item) => item.report!)
const PHASE2_START_INDEX = REPORTS.findIndex((report) =>
  report.title.includes('C区域'),
)
const PHASE3_START_INDEX = REPORTS.findIndex((report) => report.type === 'evaluation')
const PHASE_REPORTS: Record<SeatDemoPhase | 'phase3', TanqiReport[]> = {
  phase1: REPORTS.slice(0, PHASE2_START_INDEX),
  phase2: REPORTS.slice(PHASE2_START_INDEX, PHASE3_START_INDEX),
  phase3: REPORTS.slice(PHASE3_START_INDEX, PHASE3_START_INDEX + 1),
}

const ACTION_PHASE: Record<string, SeatDemoPhase | undefined> = {
  [DEMO_ACTION_TYPE.AREA_RECON_STRIKE]: 'phase1',
  [DEMO_ACTION_TYPE.REMOTE_RECON_GROUND_STRIKE]: 'phase2',
}

const emptyState = (): StateType => ({
  seat: 'command',
  activeActionId: null,
  actions: [],
  reportCursorByActionAndSeat: {},
  completedCommandPhases: { phase1: false, phase2: false },
  finalReportGenerated: false,
  messagesByActionAndSeat: {},
  actionItemsByActionId: {},
  revealedWaylineTemplateIds: [],
  nextActionId: 12001,
})

const messageKey = (actionId: number, seat: SeatDemoSeat) =>
  getSeatReportCursorKey(actionId, seat)

const cloneReport = (report: TanqiReport, index: number): TanqiReport => {
  const nextReport = JSON.parse(JSON.stringify(report)) as TanqiReport
  if (nextReport.reportNo && /日期|份数/.test(nextReport.reportNo)) {
    nextReport.reportNo = `${REPORT_PREFIX[nextReport.type]}-${dayjs().format(
      'YYYYMMDD',
    )}-${String(index).padStart(2, '0')}`
  }
  return nextReport
}

const countGeneratedReports = (state: StateType, type: TanqiReportType) =>
  Object.values(state.messagesByActionAndSeat)
    .flat()
    .filter((message) => message.report?.type === type).length

const getActionPhase = (action?: API_ACTION.domain.ActionRecord) =>
  action ? ACTION_PHASE[action.type] : undefined

const getNextRawReport = (
  state: StateType,
  actionId: number,
  seat: SeatDemoSeat,
) => {
  const action = state.actions.find((item) => item.id === actionId)
  const phase = getActionPhase(action)
  if (!phase) return null

  const cursorKey = getSeatReportCursorKey(actionId, seat)
  const cursor = state.reportCursorByActionAndSeat[cursorKey] ?? 0
  const phaseReports = PHASE_REPORTS[phase]
  const nextReport = getNextSeatReport(phaseReports, cursor, seat)
  if (nextReport) return nextReport

  return seat === 'command' &&
    state.completedCommandPhases.phase1 &&
    state.completedCommandPhases.phase2 &&
    !state.finalReportGenerated
    ? PHASE_REPORTS.phase3[0]
    : null
}

const cloneActionItemsForReport = (
  actionId: number,
  waylineTemplateId: number,
  existingCount: number,
): API_ACTION_ITEM.domain.ActionItem[] => {
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

export const useSeatDemoStore = create<StateType & ActionsType>()(
  persist(
    (set, get) => ({
      ...emptyState(),
      resetSeatDemo: () => set(emptyState()),
      setSeat: (seat) => set({ seat }),
      setActiveActionId: (activeActionId) => {
        if (get().actions.some((action) => action.id === activeActionId)) {
          set({ activeActionId })
        }
      },
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
          gmtCreateBy: 'seat-demo',
          gmtModifiedBy: 'seat-demo',
          description: data.description ?? '',
        }
        set({
          actions: [record, ...state.actions],
          activeActionId: id,
          actionItemsByActionId: {
            ...state.actionItemsByActionId,
            [id]: [],
          },
          nextActionId: id + 1,
        })
        return record
      },
      appendMessage: (actionId, seat, message) =>
        set((state) => {
          const key = messageKey(actionId, seat)
          return {
            messagesByActionAndSeat: {
              ...state.messagesByActionAndSeat,
              [key]: [...(state.messagesByActionAndSeat[key] ?? []), message],
            },
          }
        }),
      createNextReport: (actionId, seat) => {
        const state = get()
        const action = state.actions.find((item) => item.id === actionId)
        const phase = getActionPhase(action)
        if (!phase) return null

        const cursorKey = getSeatReportCursorKey(actionId, seat)
        const cursor = state.reportCursorByActionAndSeat[cursorKey] ?? 0
        const phaseReports = PHASE_REPORTS[phase]
        const seatReports = getReportsForSeat(phaseReports, seat)
        const rawReport = getNextRawReport(state, actionId, seat)
        if (!rawReport) return null

        const report = cloneReport(
          rawReport,
          countGeneratedReports(state, rawReport.type) + 1,
        )
        const nextCompletedCommandPhases = {
          ...state.completedCommandPhases,
        }
        if (seat === 'command' && cursor + 1 >= seatReports.length) {
          nextCompletedCommandPhases[phase] = true
        }

        set({
          reportCursorByActionAndSeat: {
            ...state.reportCursorByActionAndSeat,
            [cursorKey]: cursor < seatReports.length ? cursor + 1 : cursor,
          },
          completedCommandPhases: nextCompletedCommandPhases,
          finalReportGenerated:
            rawReport === PHASE_REPORTS.phase3[0] || state.finalReportGenerated,
        })

        return report
      },
      dispatchReportTask: (actionId, waylineTemplateId) => {
        let dispatchedIds: number[] = []
        set((state) => {
          const currentItems = state.actionItemsByActionId[actionId] ?? []
          const existingItems = currentItems.filter(
            (item) => String(item.taskTplId) === String(waylineTemplateId),
          )
          const targetItems = existingItems.length
            ? existingItems
            : cloneActionItemsForReport(
                actionId,
                waylineTemplateId,
                currentItems.length,
              )
          const targetIdSet = new Set(targetItems.map((item) => item.id))
          const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
          dispatchedIds = [...targetIdSet]

          const nextItems = (
            existingItems.length ? currentItems : [...currentItems, ...targetItems]
          ).map((item) =>
            targetIdSet.has(item.id)
              ? {
                  ...item,
                  status: 'PROCESSING',
                  startTime: now,
                  gmtModified: now,
                }
              : item,
          )

          return {
            actionItemsByActionId: {
              ...state.actionItemsByActionId,
              [actionId]: nextItems,
            },
            revealedWaylineTemplateIds: appendUniqueNumber(
              state.revealedWaylineTemplateIds,
              waylineTemplateId,
            ),
          }
        })
        return dispatchedIds
      },
    }),
    {
      name: 'seat-demo',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: () => emptyState(),
    },
  ),
)

export const getSeatDemoAccount = (seat: SeatDemoSeat) =>
  SEAT_DEMO_ACCOUNTS.find((account) => account.seat === seat)!

export const getSeatDemoActionList = () => useSeatDemoStore.getState().actions

export const getSeatDemoAction = (actionId?: number) =>
  useSeatDemoStore
    .getState()
    .actions.find((action) => action.id === Number(actionId))

export const getSeatDemoMessages = (actionId: number, seat: SeatDemoSeat) =>
  useSeatDemoStore.getState().messagesByActionAndSeat[messageKey(actionId, seat)] ?? []

export const getSeatDemoNextReport = (
  actionId: number,
  seat: SeatDemoSeat,
) => {
  const state = useSeatDemoStore.getState()
  return getNextRawReport(state, actionId, seat)
}

export const getSeatDemoWaylineTemplates = () => {
  const ids = useSeatDemoStore.getState().revealedWaylineTemplateIds
  return DEMO_WAYLINE_TEMPLATES.filter((item) =>
    ids.includes(item.waylineTemplateId),
  )
}

export const getSeatDemoActionItems = (actionId: number) =>
  useSeatDemoStore.getState().actionItemsByActionId[actionId] ?? []

export const getSeatDemoPreparedActionItems = (
  actionId: number,
  waylineTemplateId: number,
) => {
  const currentItems = getSeatDemoActionItems(actionId)
  const existingItems = currentItems.filter(
    (item) => String(item.taskTplId) === String(waylineTemplateId),
  )
  return existingItems.length
    ? existingItems
    : cloneActionItemsForReport(actionId, waylineTemplateId, currentItems.length)
}

export const dispatchSeatDemoReportTask = (
  actionId: number,
  waylineTemplateId: number,
) => useSeatDemoStore.getState().dispatchReportTask(actionId, waylineTemplateId)

export const canSeatUseTanqi = (seat: SeatDemoSeat) =>
  getSeatDemoAccount(seat).canUseTanqi
