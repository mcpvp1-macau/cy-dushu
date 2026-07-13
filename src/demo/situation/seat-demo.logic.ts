export type SeatDemoSeat =
  | 'command'
  | 'planning'
  | 'intelligence'
  | 'management'
  | 'display'

export type SeatDemoReportType =
  | 'task'
  | 'situation'
  | 'damage'
  | 'evaluation'
  | 'inventory'

type ReportLike = {
  type: SeatDemoReportType
}

const REPORT_SEAT: Record<SeatDemoReportType, SeatDemoSeat> = {
  task: 'command',
  situation: 'intelligence',
  damage: 'command',
  evaluation: 'command',
  inventory: 'intelligence',
}

const REPORT_LABEL: Record<SeatDemoReportType, string> = {
  task: '作战方案报告',
  situation: '态势报告',
  damage: '毁伤评估报告',
  evaluation: '作战效能评估报告',
  inventory: '装备清单报告',
}

export const getSeatForReportType = (type: SeatDemoReportType) =>
  REPORT_SEAT[type]

export const getSeatDemoReportLabel = (type: SeatDemoReportType) =>
  REPORT_LABEL[type]

export const appendUniqueNumber = (values: readonly number[], value: number) =>
  values.includes(value) ? [...values] : [...values, value]

export const getRequiredSeatForCursor = <T extends ReportLike>(
  reports: readonly T[],
  cursor: number,
) => {
  const report = reports[cursor]
  return report ? getSeatForReportType(report.type) : null
}

export const getNextSeatReport = <T extends ReportLike>(
  reports: readonly T[],
  cursor: number,
  seat: SeatDemoSeat,
) => {
  const report = reports[cursor]
  return report && getRequiredSeatForCursor(reports, cursor) === seat ? report : null
}

export const advanceSeatReportCursor = <T extends ReportLike>(
  reports: readonly T[],
  cursor: number,
  seat: SeatDemoSeat,
) => (getNextSeatReport(reports, cursor, seat) ? cursor + 1 : cursor)
