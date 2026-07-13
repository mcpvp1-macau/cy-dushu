# 五席位独立报告流程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让席位演示模式从空行动开始，由指挥决策席创建共享行动，并让各席位在当前环节内独立触发自己的预设报告，同时所有席位保留檀棋入口。

**Architecture:** 行动、当前行动、任务和航线继续保存在 `seat-demo.store.ts` 中作为五席位共享状态；报告游标改为 `行动 ID + 席位` 键控。报告脚本先按行动环节截取，再按席位职责过滤，因此指挥决策席与情报处理席互不等待。没有报告职责的席位复用现有檀棋外框，内部渲染为空。

**Tech Stack:** React 18、TypeScript、Zustand、React Query、React Router、Ant Design、Node 24 原生测试。

## Global Constraints

- 保留 `standard` 和 `full-flow` 的页面、状态与交互。
- 初始行动列表为空，只有指挥决策席显示并使用现有“创建行动”弹窗。
- 行动、当前环节、任务和航线在五席位之间共享。
- 报告会话和游标按“行动 + 席位”隔离。
- 五个席位都显示檀棋入口；任务规划席、综合管理席、综合显示席的檀棋内部为空。
- 任务和航线仍只在作战方案点击“立即执行”后显示，重复下发保持幂等。
- 使用 `/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm` 执行项目命令。

---

### Task 1: 席位独立报告纯逻辑

**Files:**
- Modify: `tests/seat-demo.logic.test.ts`
- Modify: `src/demo/situation/seat-demo.logic.ts`

**Interfaces:**
- Produces: `getReportsForSeat<T>(reports, seat): T[]`
- Produces: `getSeatReportCursorKey(actionId, seat): string`
- Produces: `getNextSeatReport<T>(reports, cursor, seat): T | null`
- Produces: `advanceSeatReportCursor<T>(reports, cursor, seat): number`

- [ ] **Step 1: Write failing tests for independent seat sequences**

```ts
test('builds independent report sequences for the same phase', () => {
  const reports = [
    { type: 'task' },
    { type: 'situation' },
    { type: 'damage' },
    { type: 'inventory' },
  ] as const

  assert.deepEqual(getReportsForSeat(reports, 'command').map((item) => item.type), [
    'task',
    'damage',
  ])
  assert.deepEqual(
    getReportsForSeat(reports, 'intelligence').map((item) => item.type),
    ['situation', 'inventory'],
  )
})

test('uses a different cursor key for each seat in one action', () => {
  assert.equal(getSeatReportCursorKey(12001, 'command'), '12001:command')
  assert.equal(getSeatReportCursorKey(12001, 'intelligence'), '12001:intelligence')
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --experimental-strip-types tests/seat-demo.logic.test.ts
```

Expected: FAIL because `getReportsForSeat` and `getSeatReportCursorKey` are not exported.

- [ ] **Step 3: Implement report filtering and keyed cursors**

```ts
export const getReportsForSeat = <T extends ReportLike>(
  reports: readonly T[],
  seat: SeatDemoSeat,
) => reports.filter((report) => getSeatForReportType(report.type) === seat)

export const getSeatReportCursorKey = (
  actionId: number,
  seat: SeatDemoSeat,
) => `${actionId}:${seat}`

export const getNextSeatReport = <T extends ReportLike>(
  reports: readonly T[],
  cursor: number,
  seat: SeatDemoSeat,
) => getReportsForSeat(reports, seat)[cursor] ?? null
```

Update `advanceSeatReportCursor` to advance only within the filtered seat sequence. Remove the obsolete cross-seat `getRequiredSeatForCursor` behavior and update its old tests.

- [ ] **Step 4: Run the focused test and verify GREEN**

Expected: all seat logic tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/seat-demo.logic.test.ts src/demo/situation/seat-demo.logic.ts
git commit -m "test: define independent seat report sequences"
```

### Task 2: 空行动初始状态与共享行动创建

**Files:**
- Modify: `src/demo/situation/seat-demo.store.ts`
- Modify: `src/service/modules/action/index.ts`
- Modify: `src/pages/situation/action/index.tsx`

**Interfaces:**
- `activeActionId: number | null`
- `reportCursorByActionAndSeat: Record<string, number>`
- `addAction(data): API_ACTION.domain.ActionRecord`
- `setActiveActionId(actionId: number): void`

- [ ] **Step 1: Add failing state-shape assertions to the pure test surface**

Add tests for `getSeatReportCursorKey` and independent cursor advancement before changing store consumers. Run the focused test to confirm the new expectations fail until Task 1 is complete.

- [ ] **Step 2: Replace preloaded seat state with empty shared action state**

```ts
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
```

Add `addAction` using the existing full-flow record shape. Insert the record at the start of `actions`, initialize its action items, set it as `activeActionId`, and increment `nextActionId`.

- [ ] **Step 3: Make report generation seat-independent**

For the current action, compute its phase report list, filter with `getReportsForSeat`, and read/update `reportCursorByActionAndSeat[getSeatReportCursorKey(actionId, seat)]`. Mark phase completion only when the command seat finishes its own phase sequence; the intelligence cursor never blocks or advances command reports.

- [ ] **Step 4: Route seat-mode action creation through the store**

In `service/modules/action/index.ts`, add a seat-demo branch to `addAction`. In `src/pages/situation/action/index.tsx`, show `<AddAction />` during seat-demo only when `seat === 'command'`; hide it for the other four seats.

- [ ] **Step 5: Run typecheck and focused tests**

Run:

```bash
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --experimental-strip-types tests/seat-demo.logic.test.ts
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm ts
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/demo/situation/seat-demo.store.ts src/service/modules/action/index.ts src/pages/situation/action/index.tsx
git commit -m "feat: create shared actions from command seat"
```

### Task 3: 全席位檀棋入口与空内容

**Files:**
- Modify: `src/components/right-tools/index.tsx`
- Modify: `src/pages/situation/action/detail/components/ActionTanqi/ActionTanqi.tsx`
- Modify: `src/components/Tanqi/demo/SeatTanqiDemo.tsx`

**Interfaces:**
- `canSeatUseTanqi(seat)` continues to mean the seat has report content, not whether the entry is visible.
- `SeatTanqiDemo` renders an empty full-size container when `canSeatUseTanqi(seat)` is false.

- [ ] **Step 1: Remove seat permission from entry visibility**

Set the global toolbar condition to:

```ts
const showTanqiEntry =
  globalConfig.useFixedWingDemo && !pathname.includes('/action/')
```

Remove the seat-mode early return from action detail `ActionTanqi`; keep the duplicate-entry protection unchanged.

- [ ] **Step 2: Render empty Tanqi content for three seats**

At the start of `SeatTanqiDemo`, after hooks are declared, render `<div className="size-full" />` when the active account has no Tanqi content. Do not render the input box, placeholder, cross-seat instructions, report cards or task buttons.

- [ ] **Step 3: Simplify report input eligibility**

For command/intelligence seats, enable submission only when an action is active, the seat has a next report in its independent sequence, and no reply is pending. Use placeholders `请先创建或选择行动。`, `当前环节报告已生成完成。`, or `请输入演示指令。`; remove all “请切换至某席位” text.

- [ ] **Step 4: Verify compilation and lint**

Run:

```bash
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm ts
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm lint
```

Expected: both commands exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/right-tools/index.tsx src/pages/situation/action/detail/components/ActionTanqi/ActionTanqi.tsx src/components/Tanqi/demo/SeatTanqiDemo.tsx
git commit -m "feat: keep tanqi entry for every seat"
```

### Task 4: 本地验收与回归验证

**Files:**
- Modify only if verification exposes a concrete defect.

- [ ] **Step 1: Run automated verification**

```bash
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test --experimental-strip-types tests/seat-demo.logic.test.ts
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm ts
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm lint
/Users/zhengzetec/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm build:pages
```

Expected: all commands exit 0.

- [ ] **Step 2: Verify browser behavior at `http://localhost:5173/action`**

Check that reset seat mode starts empty; only command seat can create an action; switching seats preserves the action/current action; command and intelligence each generate their own first report without waiting; all five seats show the Tanqi icon; the three non-report seats show an empty panel; task and wayline stay hidden before dispatch and appear once after dispatch.

- [ ] **Step 3: Check standard and full-flow modes**

Switch out of seat-demo and confirm their action lists and Tanqi behavior are unchanged.

- [ ] **Step 4: Commit only concrete verification fixes**

If browser verification requires a fix, stage only that fix and commit it as `fix: polish independent seat demo flow`. Do not create an empty commit.

## Plan self-review

- Spec coverage: Tasks 1-3 cover independent report cursors, empty initial actions, command-only creation, shared actions, all-seat Tanqi entry and empty content. Task 4 covers shared task/wayline behavior, table-derived default routes and regression safety.
- Placeholder scan: no `TBD`, `TODO`, deferred error handling or unspecified interface remains.
- Type consistency: `activeActionId`, `reportCursorByActionAndSeat`, `getSeatReportCursorKey`, `getReportsForSeat` and `addAction` use the same names across tasks.
