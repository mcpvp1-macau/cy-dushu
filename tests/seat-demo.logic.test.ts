import assert from 'node:assert/strict'
import test from 'node:test'
import {
  advanceSeatReportCursor,
  getNextSeatReport,
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
