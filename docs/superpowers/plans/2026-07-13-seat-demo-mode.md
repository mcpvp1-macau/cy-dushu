# 五席位演示模式 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated five-seat demo mode where account switching controls seat pages and only authorized seats progress the shared, ordered Tanqi report flow.

**Architecture:** Extend the existing mode discriminant with `seat-demo`, but keep all seat-specific state in a new Zustand store. A dependency-free logic module owns report-to-seat ownership and shared cursor advancement; services branch to the new store only while the new mode is active. Reuse the existing report card and task confirmation UI, adding narrow optional inputs for seat-specific labels and dispatch.

**Tech Stack:** React 18, TypeScript, Zustand, React Query, React Router, Ant Design, Node 24 native test runner.

## Global Constraints

- Preserve `standard` and `full-flow` behavior and stored data.
- Use the five seat names as user-visible account names.
- Do not emit model prose outside of structured reports.
- Only 指挥决策席 and 情报处理席 can open Tanqi.
- Keep task/wayline state local to `seat-demo`; repeat dispatch must not duplicate rows.
- Use `/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm` for commands in this checkout.

---

### Task 1: Seat report logic and executable tests

**Files:**
- Create: `src/demo/situation/seat-demo.logic.ts`
- Create: `tests/seat-demo.logic.test.ts`

**Interfaces:**
- Produces `SeatDemoSeat`, `getSeatForReportType`, `getNextSeatReport`, and `advanceSeatReportCursor`.
- Consumes `TanqiReport` only as a type; no aliases or browser globals so the module can run under Node.

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  advanceSeatReportCursor,
  getNextSeatReport,
  getSeatForReportType,
} from '../src/demo/situation/seat-demo.logic.ts'

test('routes task, damage and evaluation reports to command seat', () => {
  assert.equal(getSeatForReportType('task'), 'command')
  assert.equal(getSeatForReportType('damage'), 'command')
  assert.equal(getSeatForReportType('evaluation'), 'command')
})

test('does not advance a shared cursor from the wrong seat', () => {
  const reports = [{ type: 'task' }, { type: 'situation' }] as any
  assert.equal(getNextSeatReport(reports, 0, 'intelligence'), null)
  assert.equal(advanceSeatReportCursor(reports, 0, 'intelligence'), 0)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types tests/seat-demo.logic.test.ts`

Expected: FAIL because `src/demo/situation/seat-demo.logic.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export type SeatDemoSeat = 'command' | 'planning' | 'intelligence' | 'management' | 'display'

const REPORT_SEAT = {
  task: 'command',
  damage: 'command',
  evaluation: 'command',
  situation: 'intelligence',
  inventory: 'intelligence',
} as const

export const getSeatForReportType = (type: keyof typeof REPORT_SEAT) => REPORT_SEAT[type]
```

Implement `getNextSeatReport` to return the report only when the current cursor belongs to `seat`; implement `advanceSeatReportCursor` as `cursor + 1` only when `getNextSeatReport` returns a report.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types tests/seat-demo.logic.test.ts`

Expected: 2 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/demo/situation/seat-demo.logic.ts tests/seat-demo.logic.test.ts
git commit -m "test: cover seat demo report sequence"
```

### Task 2: Isolated seat-demo state and mode selection

**Files:**
- Create: `src/demo/situation/seat-demo.store.ts`
- Modify: `src/demo/situation/full-flow-demo.store.ts`
- Modify: `src/components/Navigator/index.tsx`

**Interfaces:**
- `SeatDemoState` exposes `seat`, `activeActionId`, `messagesByActionAndSeat`, `reportCursorByActionId`, and dispatch helpers.
- `isSeatDemoMode()` returns `true` only when the shared mode is `seat-demo`.
- `setSeatDemoSeat(seat)` changes the selected account without resetting messages.

- [ ] **Step 1: Write the failing test**

Add a third test in `tests/seat-demo.logic.test.ts` that imports `getNextSeatReport` and asserts that the same cursor exposes the task report to `command`, then exposes the situation report to `intelligence` after the command cursor advances.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types tests/seat-demo.logic.test.ts`

Expected: FAIL because the implementation does not yet return the next owned report after a valid cursor advancement.

- [ ] **Step 3: Write minimal implementation**

Create `seat-demo.store.ts` with deep-cloned `DEMO_ACTIONS`, empty action-item state, `activeActionId` defaulting to `9001`, and persistent key `seat-demo`. Add `seat-demo` to `DemoPageMode`; add a second navigator icon that calls `resetSeatDemo()`, sets the shared mode to `seat-demo`, clears Tanqi side panels, and routes to `/action`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types tests/seat-demo.logic.test.ts`

Expected: 3 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/demo/situation/seat-demo.store.ts src/demo/situation/full-flow-demo.store.ts src/components/Navigator/index.tsx tests/seat-demo.logic.test.ts
git commit -m "feat: add isolated seat demo state"
```

### Task 3: Account menu and seat-gated Tanqi experience

**Files:**
- Create: `src/components/Header/SeatDemoAccountMenu.tsx`
- Create: `src/components/Tanqi/demo/SeatTanqiDemo.tsx`
- Modify: `src/components/Header/UserDownMenu.tsx`
- Modify: `src/components/Header/index.tsx`
- Modify: `src/components/right-tools/index.tsx`
- Modify: `src/pages/situation/action/detail/components/ActionTanqi/ActionTanqi.tsx`
- Modify: `src/pages/right/ActionTanqi/ActionTanqiWrapper.tsx`
- Modify: `src/components/Tanqi/demo/TanqiReportCard.tsx`
- Modify: `src/pages/situation/action/detail/index.tsx`

**Interfaces:**
- `SeatTanqiDemo` reads active seat/action and uses `getNextSeatReport` before enabling the input.
- `TanqiReportCard` accepts optional `badgeLabel` and `titleLabel`; existing callers omit both.
- `SeatDemoAccountMenu` navigates to the designated seat route and sets the selected seat.

- [ ] **Step 1: Write the failing test**

Extend `tests/seat-demo.logic.test.ts` with a report sequence containing `task`, `situation`, `damage`; assert only command can consume indexes 0 and 2, and only intelligence can consume index 1.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types tests/seat-demo.logic.test.ts`

Expected: FAIL if `getNextSeatReport` does not gate every sequence position by seat.

- [ ] **Step 3: Write minimal implementation**

Render `SeatDemoAccountMenu` in the existing top-right user popup only while `isSeatDemoMode()`. Route the five buttons to `/action`, `/wayline`, `/situation/events`, `/sources?type=UAV`, and `/source/UAV`. Hide the global and action-detail Tanqi launchers for `planning`, `management`, and `display`; render `SeatTanqiDemo` in the existing right panel and float dialog path. In the action-detail effect, call `setActiveActionId(actionId)` when seat mode is active. Keep all existing non-seat Tanqi components unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types tests/seat-demo.logic.test.ts`

Expected: all report ownership tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header src/components/Tanqi/demo src/components/right-tools/index.tsx src/pages/right/ActionTanqi src/pages/situation/action/detail
git commit -m "feat: add seat accounts and gated Tanqi"
```

### Task 4: Seat-mode task and wayline isolation

**Files:**
- Modify: `src/demo/situation/seat-demo.store.ts`
- Modify: `src/service/modules/action/index.ts`
- Modify: `src/service/modules/action-item/index.ts`
- Modify: `src/service/modules/wayline/index.ts`
- Modify: `src/components/Tanqi/demo/task-execution.ts`
- Modify: `src/components/Tanqi/demo/TanqiTaskExecutionModal.tsx`

**Interfaces:**
- `getSeatDemoPreparedActionItems(actionId, waylineTemplateId)` returns a clone without persisting it.
- `dispatchSeatDemoReportTask(actionId, waylineTemplateId)` is idempotent and returns affected task ids.
- `getSeatDemoWaylineTemplates()` returns only revealed templates.

- [ ] **Step 1: Write the failing test**

Add a logic test with a `Set<number>` representing revealed wayline ids and assert that dispatching the same template twice leaves its cardinality at one. Keep this test in `seat-demo.logic.test.ts` as a pure helper test.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types tests/seat-demo.logic.test.ts`

Expected: FAIL because the new idempotent helper has not been exported.

- [ ] **Step 3: Write minimal implementation**

Use the existing full-flow cloning pattern, but branch only on `isSeatDemoMode()`. Make `getTanqiTaskExecutionPreset` choose seat-mode action data, and make the existing confirmation modal call the seat dispatcher before invalidating action-item and wayline queries. Do not change standard or full-flow dispatch code.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types tests/seat-demo.logic.test.ts`

Expected: all tests pass, including repeated-dispatch protection.

- [ ] **Step 5: Commit**

```bash
git add src/demo/situation/seat-demo.store.ts src/service/modules/action/index.ts src/service/modules/action-item/index.ts src/service/modules/wayline/index.ts src/components/Tanqi/demo/task-execution.ts src/components/Tanqi/demo/TanqiTaskExecutionModal.tsx tests/seat-demo.logic.test.ts
git commit -m "feat: isolate seat demo task dispatch"
```

### Task 5: Full verification and browser acceptance pass

**Files:**
- Modify only if verification exposes a concrete defect.

- [ ] **Step 1: Run automated verification**

Run:

```bash
node --test --experimental-strip-types tests/seat-demo.logic.test.ts
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm ts
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm lint
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm build:pages
```

Expected: every command exits with status 0.

- [ ] **Step 2: Run local server and inspect the interaction**

Run: `/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm dev -- --host 127.0.0.1 --port 5174`

Check: enable seat mode; verify all five account menu entries; verify each route; verify only command/intelligence expose Tanqi; trigger command then intelligence reports in order; confirm a RW report and verify the task and route appear exactly once.

- [ ] **Step 3: Commit a concrete verification-only fix only when Step 2 exposed one**

If browser verification exposes a defect, stage only the file changed to address that defect and use `git commit -m "fix: polish seat demo flow"`. If browser verification exposes no defect, do not create an empty commit.

## Plan self-review

- Spec coverage: Tasks 1-4 cover state isolation, account routes, seat permission, shared report order, dispatch and wayline visibility; Task 5 covers compile, lint, production build and interaction checks.
- Placeholder scan: no deferred implementation markers or unspecified interfaces remain.
- Type consistency: `SeatDemoSeat`, `getNextSeatReport`, `getSeatDemoPreparedActionItems`, and `dispatchSeatDemoReportTask` use identical names throughout.
