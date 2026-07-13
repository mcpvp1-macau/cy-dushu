import dayjs from 'dayjs'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEMO_ACTIONS,
  DEMO_ACTION_TYPE,
  DEMO_WAYLINE_TEMPLATES,
} from './constants'
import {
  getRequiredSeatForCursor,
  getSeatForReportType,
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
  activeActionId: number
  actions: API_ACTION.domain.ActionRecord[]
  reportCursorByActionId: Record<number, number>
  completedPhases: Record<SeatDemoPhase, boolean>
  finalReportGenerated: boolean
  messagesByActionAndSeat: Record<string, SeatDemoMessage[]>
  actionItemsByActionId: Record<number, API_ACTION_ITEM.domain.ActionItem[]>
  revealedWaylineTemplateIds: number[]
}

type ActionsType = {
  resetSeatDemo: () => void
  setSeat: (seat: SeatDemoSeat) => void
  setActiveActionId: (actionId: number) => void
  appendMessage: (
    actionId: number,
    seat: SeatDemoSeat,
    message: SeatDemoMessage,
  ) => void
  createNextReport: (actionId: number, seat: SeatDemoSeat) => TanqiReport | null
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

const cloneActions = () =>
  JSON.parse(JSON.stringify(DEMO_ACTIONS)) as API_ACTION.domain.ActionRecord[]

const emptyState = (): StateType => ({
  seat: 'command',
  activeActionId: DEMO_ACTIONS[0]?.id ?? 9001,
  actions: cloneActions(),
  reportCursorByActionId: {},
  completedPhases: { phase1: false, phase2: false },
  finalReportGenerated: false,
  messagesByActionAndSeat: {},
  actionItemsByActionId: {},
  revealedWaylineTemplateIds: [],
})

const messageKey = (actionId: number, seat: SeatDemoSeat) =>
  `${actionId}:${seat}`

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

const getNextRawReport = (state: StateType, actionId: number) => {
  const action = state.actions.find((item) => item.id === actionId)
  const phase = getActionPhase(action)
  if (!phase) return null

  const cursor = state.reportCursorByActionId[actionId] ?? 0
  const phaseReports = PHASE_REPORTS[phase]
  if (cursor < phaseReports.length) return phaseReports[cursor]

  return state.completedPhases.phase1 &&
    state.completedPhases.phase2 &&
    !state.finalReportGenerated
    ? PHASE_REPORTS.phase3[0]
    : null
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

        const cursor = state.reportCursorByActionId[actionId] ?? 0
        const phaseReports = PHASE_REPORTS[phase]
        const rawReport = getNextRawReport(state, actionId)
        if (!rawReport || getSeatForReportType(rawReport.type) !== seat) {
          return null
        }

        const report = cloneReport(
          rawReport,
          countGeneratedReports(state, rawReport.type) + 1,
        )
        const nextCompletedPhases = { ...state.completedPhases }
        if (cursor + 1 >= phaseReports.length) {
          nextCompletedPhases[phase] = true
        }

        set({
          reportCursorByActionId: {
            ...state.reportCursorByActionId,
            [actionId]: cursor < phaseReports.length ? cursor + 1 : cursor,
          },
          completedPhases: nextCompletedPhases,
          finalReportGenerated:
            rawReport === PHASE_REPORTS.phase3[0] || state.finalReportGenerated,
        })

        return report
      },
    }),
    {
      name: 'seat-demo',
      storage: createJSONStorage(() => localStorage),
      version: 1,
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

export const getSeatDemoRequiredSeat = (actionId: number) => {
  const state = useSeatDemoStore.getState()
  const action = state.actions.find((item) => item.id === actionId)
  const phase = getActionPhase(action)
  if (!phase) return null

  const cursor = state.reportCursorByActionId[actionId] ?? 0
  const phaseReports = PHASE_REPORTS[phase]
  const rawReport = getNextRawReport(state, actionId)
  if (!rawReport) return null

  if (cursor < phaseReports.length) {
    return getRequiredSeatForCursor(phaseReports, cursor)
  }
  return getSeatForReportType(rawReport.type)
}

export const getSeatDemoWaylineTemplates = () => {
  const ids = useSeatDemoStore.getState().revealedWaylineTemplateIds
  return DEMO_WAYLINE_TEMPLATES.filter((item) =>
    ids.includes(item.waylineTemplateId),
  )
}

export const canSeatUseTanqi = (seat: SeatDemoSeat) =>
  getSeatDemoAccount(seat).canUseTanqi
