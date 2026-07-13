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

export const getSeatForReportType = (type: SeatDemoReportType) =>
  REPORT_SEAT[type]

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
