import { REPORT_TYPE_CONFIG, TanqiReport, TanqiReportType } from './report-data'
import { Button } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import TanqiTaskExecutionModal from './TanqiTaskExecutionModal'
import { getTanqiTaskExecutionPreset } from './task-execution'

type PropsType = {
  report: TanqiReport
  actionId?: number
  badgeLabel?: string
}

/** 各报告类型 badge 配色 (对齐原型) */
const BADGE_CLS: Record<TanqiReportType, string> = {
  task: 'text-sky-300 bg-sky-900/50 border-sky-600/50',
  situation: 'text-teal-300 bg-teal-900/50 border-teal-600/50',
  damage: 'text-red-300 bg-red-900/50 border-red-600/50',
  evaluation: 'text-violet-300 bg-violet-900/50 border-violet-600/50',
  inventory: 'text-fore bg-ground-3 border-ground-3',
}

/** 檀棋结构化报告卡片（演示） */
const TanqiReportCard: FC<PropsType> = memo(({ report, actionId, badgeLabel }) => {
  const config = REPORT_TYPE_CONFIG[report.type]
  const [executionOpen, setExecutionOpen] = useState(false)
  const executionPreset = useMemo(
    () => getTanqiTaskExecutionPreset(report, actionId),
    [actionId, report],
  )

  return (
    <div className="w-full rounded border border-solid border-ground-3 bg-ground-2 overflow-hidden text-sm">
      {/* 头部: badge + 标题 (原型样式) */}
      <div className="px-2.5 py-2 flex items-center gap-2">
        <span
          className={
            'shrink-0 px-2 py-0.5 text-xs rounded-sm border border-solid ' +
            BADGE_CLS[report.type]
          }
        >
          {badgeLabel ?? config.badge}
        </span>
        <h3 className="m-0 text-hightlight text-sm font-medium truncate">
          {report.title}
        </h3>
      </div>

      <div className="px-2.5 pb-2.5 flex flex-col gap-2.5">
        {/* 字段盒 (报告编号 + 键值信息, 原型字段卡片) */}
        {(report.reportNo || !!report.meta?.length) && (
          <div className="grid grid-cols-2 gap-1.5">
            {report.reportNo && (
              <div className="min-w-0 rounded bg-ground-3 px-2.5 py-1.5">
                <div className="text-fore opacity-60 text-xs">报告编号</div>
                <div className="text-hightlight text-sm truncate">
                  {report.reportNo}
                </div>
              </div>
            )}
            {report.meta?.map(([key, value]) => (
              <div key={key} className="min-w-0 rounded bg-ground-3 px-2.5 py-1.5">
                <div className="text-fore opacity-60 text-xs">{key}</div>
                <div className="text-hightlight text-sm truncate">{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* 分段内容 */}
        {report.sections?.map((section) => (
          <div key={section.title}>
            <div className="text-fore opacity-70 text-xs mb-1">
              {section.title}
            </div>
            <ul className="m-0 p-0 list-none flex flex-col gap-1">
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className="pl-2 border-l-2 border-solid border-primary/50 text-fore text-xs leading-5"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* 表格 */}
        {report.tables?.map((table, ti) => (
          <div key={ti} className="min-w-0">
            {table.title && (
              <div className="text-fore opacity-70 text-xs mb-1">
                {table.title}
              </div>
            )}
            <div className="overflow-x-auto rounded border border-solid border-ground-3">
              <table className="w-full border-collapse text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-ground-3 text-hightlight">
                    {table.headers.map((h) => (
                      <th key={h} className="px-2 py-1.5 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-t border-solid border-ground-3 text-fore"
                    >
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-2 py-1.5">
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* 结论 */}
        {report.conclusion && (
          <div className="rounded bg-ground-3 px-2.5 py-2 text-xs text-hightlight leading-5">
            {report.conclusion}
          </div>
        )}

        {executionPreset && (
          <div className="flex justify-center">
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => setExecutionOpen(true)}
            >
              执行任务
            </Button>
          </div>
        )}
      </div>

      {executionPreset && (
        <TanqiTaskExecutionModal
          open={executionOpen}
          preset={executionPreset}
          onClose={() => setExecutionOpen(false)}
        />
      )}
    </div>
  )
})

TanqiReportCard.displayName = 'TanqiReportCard'

export default TanqiReportCard
