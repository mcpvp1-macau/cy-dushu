import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import XTable from '@/components/ui/XTable.tsx'
import { emtpyArray } from '@/constant/data'
import { getActionPlanRecordList } from '@/service/modules/action-plan'
import { InfoCircleOutlined } from '@ant-design/icons'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DatePicker, Pagination, Select, Tooltip } from 'antd'
import { Dayjs } from 'dayjs'
import { memo, type FC } from 'react'

type PropsType = unknown

const statusMap = {
  PROCESSING: '执行中',
  TERMINATE: '执行中断',
  FAILED: '执行失败',
  FINISH: '执行成功',
  PENDING: '未执行',
}
const colorMap = {
  PROCESSING: '#4C90F0',
  FINISH: '#15B371',
  FAILED: '#DD4444',
  TERMINATE: '#DD4444',
  PENDING: 'white',
}

const statusOptions = Object.entries(statusMap).map(([value, label]) => ({
  value,
  label,
}))

const columnHelper = createColumnHelper<API_ACTION_PLAN.domain.PlanRecord>()

const columns = [
  columnHelper.accessor('startTime', {
    header: '开始时间',
  }),
  columnHelper.accessor('endTime', {
    header: '结束时间',
  }),
  columnHelper.accessor('status', {
    header: '执行状态',
    cell: (cell) => {
      return (
        <p className="flex gap-2 items-center">
          <div
            className="w-2 h-2 rounded"
            style={{ background: colorMap[cell.getValue()!] ?? 'white' }}
          />
          {statusMap[cell.getValue()!] || '-'}
          <Tooltip title={cell.row.original.message}>
            <InfoCircleOutlined className="text-orange-400" />
          </Tooltip>
        </p>
      )
    },
  }),
  columnHelper.accessor('actionName', {
    header: '行动名称',
  }),
  columnHelper.accessor('deviceName', {
    header: '设备名称',
    cell: (cell) => cell.getValue() || '-',
  }),
]

const ScheduleTable: FC<PropsType> = memo(() => {
  const actionPlanId = parseInt(useParams().actionPlanId ?? '0') || null

  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs] | null>()
  const [status, setStatus] = useState<string | null>()
  const startTime = timeRange?.[0]?.format('YYYY-MM-DD 00:00:00')
  const endTime = timeRange?.[1]?.format('YYYY-MM-DD 23:59:59')

  const queryClient = useQueryClient()
  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: [
        'getActionPlanRecordList',
        { actionPlanId, status, startTime, endTime },
      ],
      queryFn: () =>
        getActionPlanRecordList({
          actionPlanId: actionPlanId!,
          status: status || undefined,
          startTime: startTime,
          endTime: endTime,
        }),
      select: (d) => d.data,
      enabled: !!actionPlanId,
    },
    queryClient,
  )

  const table = useReactTable({
    data: data?.rows ?? emtpyArray,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.deviceId,
  })

  return (
    <div className="grow flex flex-col overflow-hidden">
      <section className="m-3 flex gap-3">
        <DatePicker.RangePicker
          value={timeRange}
          onChange={(v) => setTimeRange(v ? [v[0]!, v[1]!] : null)}
        />
        <Select
          className="w-32"
          placeholder="请选择"
          allowClear
          value={status}
          options={statusOptions}
          onChange={setStatus}
        />
      </section>
      <section className="grow mx-3 mb-3 flex flex-col overflow-y-hidden">
        <ScrollArea className="grow border border-solid border-ground-200 rounded">
          <XTable table={table} loading={isLoading || isRefetching} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="mt-1 flex justify-end">
          <Pagination />
        </div>
      </section>
    </div>
  )
})

ScheduleTable.displayName = 'ScheduleTable'

export default ScheduleTable
