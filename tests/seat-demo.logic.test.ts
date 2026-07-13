import assert from 'node:assert/strict'
import test from 'node:test'
import {
  advanceSeatReportCursor,
  getSeatDemoReportLabel,
  getNextSeatReport,
  getRequiredSeatForCursor,
  getSeatForReportType,
} from '../src/demo/situation/seat-demo.logic.ts'

test('routes command reports to the command seat', () => {
  assert.equal(getSeatForReportType('task'), 'command')
  assert.equal(getSeatForReportType('damage'), 'command')
  assert.equal(getSeatForReportType('evaluation'), 'command')
})

test('does not advance a shared cursor from the wrong seat', () => {
  const reports = [{ type: 'task' }, { type: 'situation' }] as const

  assert.equal(getNextSeatReport(reports, 0, 'intelligence'), null)
  assert.equal(advanceSeatReportCursor(reports, 0, 'intelligence'), 0)
})

test('reveals the seat required for the next report after command advances', () => {
  const reports = [{ type: 'task' }, { type: 'situation' }] as const
  const nextCursor = advanceSeatReportCursor(reports, 0, 'command')

  assert.equal(nextCursor, 1)
  assert.equal(getRequiredSeatForCursor(reports, nextCursor), 'intelligence')
})

test('uses seat-specific names for structured reports', () => {
  assert.equal(getSeatDemoReportLabel('task'), '作战方案报告')
  assert.equal(getSeatDemoReportLabel('damage'), '毁伤评估报告')
  assert.equal(getSeatDemoReportLabel('evaluation'), '作战效能评估报告')
  assert.equal(getSeatDemoReportLabel('situation'), '态势报告')
})
