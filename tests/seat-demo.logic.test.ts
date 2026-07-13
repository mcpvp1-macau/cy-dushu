import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SEAT_DEMO_INPUT_PLACEHOLDER,
  advanceSeatReportCursor,
  appendUniqueNumber,
  getSeatDemoReportLabel,
  getNextSeatReport,
  getReportsForSeat,
  getSeatReportCursorKey,
  getSeatForReportType,
} from '../src/demo/situation/seat-demo.logic.ts'

test('uses one neutral Tanqi message placeholder', () => {
  assert.equal(SEAT_DEMO_INPUT_PLACEHOLDER, '向檀棋发送消息。')
})

test('routes command reports to the command seat', () => {
  assert.equal(getSeatForReportType('task'), 'command')
  assert.equal(getSeatForReportType('damage'), 'command')
  assert.equal(getSeatForReportType('evaluation'), 'command')
})

test('builds independent report sequences for the same phase', () => {
  const reports = [
    { type: 'task' },
    { type: 'situation' },
    { type: 'damage' },
    { type: 'inventory' },
  ] as const

  assert.deepEqual(
    getReportsForSeat(reports, 'command').map((item) => item.type),
    ['task', 'damage'],
  )
  assert.deepEqual(
    getReportsForSeat(reports, 'intelligence').map((item) => item.type),
    ['situation', 'inventory'],
  )
})

test('advances each seat within its own filtered report sequence', () => {
  const reports = [
    { type: 'task' },
    { type: 'situation' },
    { type: 'damage' },
  ] as const

  assert.equal(getNextSeatReport(reports, 0, 'command')?.type, 'task')
  assert.equal(getNextSeatReport(reports, 0, 'intelligence')?.type, 'situation')
  assert.equal(advanceSeatReportCursor(reports, 0, 'command'), 1)
  assert.equal(getNextSeatReport(reports, 1, 'command')?.type, 'damage')
})

test('uses a different cursor key for each seat in one action', () => {
  assert.equal(getSeatReportCursorKey(12001, 'command'), '12001:command')
  assert.equal(
    getSeatReportCursorKey(12001, 'intelligence'),
    '12001:intelligence',
  )
})

test('returns an empty report sequence for seats without report content', () => {
  const reports = [{ type: 'task' }, { type: 'situation' }] as const

  assert.deepEqual(getReportsForSeat(reports, 'planning'), [])
})

test('uses seat-specific names for structured reports', () => {
  assert.equal(getSeatDemoReportLabel('task'), '作战方案报告')
  assert.equal(getSeatDemoReportLabel('damage'), '毁伤评估报告')
  assert.equal(getSeatDemoReportLabel('evaluation'), '作战效能评估报告')
  assert.equal(getSeatDemoReportLabel('situation'), '态势报告')
})

test('reveals a wayline identifier only once', () => {
  assert.deepEqual(appendUniqueNumber([9102], 9102), [9102])
  assert.deepEqual(appendUniqueNumber([9102], 9103), [9102, 9103])
})
