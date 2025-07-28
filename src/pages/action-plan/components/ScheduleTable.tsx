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
import { Pagination, Select, Tooltip } from 'antd'
import { Dayjs } from 'dayjs'
import StartBreakPoint from './StartBreakPoint'
import DateRangePicker from '@/components/AntdOverride/DateRangePicker'

type PropsType = unknown

const colorMap = {
  PROCESSING: '#4C90F0',
  FINISH: '#15B371',
  FINISHED: '#15B371',
  FAILED: '#DD4444',
  TERMINATE: '#DD4444',
  PENDING: 'white',
}

const columnHelper = createColumnHelper<API_ACTION_PLAN.domain.PlanRecord>()

const ScheduleTable: FC<PropsType> = memo(() => {
  const actionPlanId = parseInt(useParams().actionPlanId ?? '0') || null

  const { t, i18n } = useTranslation()

  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs] | null>()
  const [status, setStatus] = useState<string | null>()
  const startTime = timeRange?.[0]?.format('YYYY-MM-DD 00:00:00')
  const endTime = timeRange?.[1]?.format('YYYY-MM-DD 23:59:59')

  const queryClient = useQueryClient()
  const { data, isLoading, isRefetching, refetch } = useQuery(
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

  const statusOptions = useMemo(() => {
    return [
      'PROCESSING',
      'TERMINATE',
      'FAILED',
      // 'FINISH',
      'FINISHED',
      'PENDING',
    ].map((value) => ({
      value,
      label: t(`schedule.table.status.${value}.title`),
    }))
  }, [t, i18n])

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('startTime', {
        header: t('common.startTime'),
      }),
      columnHelper.accessor('endTime', {
        header: t('common.endTime'),
      }),
      columnHelper.accessor('status', {
        header: t('common.status'),
        cell: (cell) => {
          return (
            <p className="flex gap-2 items-center">
              <div
                className="w-2 h-2 rounded"
                style={{ background: colorMap[cell.getValue()!] ?? 'white' }}
              />
              {cell.getValue()
                ? t(`schedule.table.status.${cell.getValue()}.title`)
                : '-'}
              <Tooltip title={cell.row.original.message}>
                <InfoCircleOutlined className="text-fore" />
              </Tooltip>
            </p>
          )
        },
      }),
      columnHelper.accessor('actionName', {
        header: t('schedule.table.actionName.title'),
      }),
      columnHelper.accessor('deviceName', {
        header: t('schedule.table.deviceName.title'),
        cell: (cell) => cell.getValue() || '-',
      }),
      columnHelper.accessor('operation', {
        header: t('common.operation'),
        cell: (cell) => {
          const abp = cell.row.original.actionBreakPoint
          if (!abp?.id) {
            return '-'
          }
          return <StartBreakPoint id={abp.id} onSuccess={refetch} />
        },
      }),
    ]
  }, [t, refetch])

  const table = useReactTable({
    data: data?.rows ?? emtpyArray,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.deviceId,
  })

  return (
    <div className="grow flex flex-col overflow-hidden">
      <section className="m-3 flex gap-3">
        <DateRangePicker
          value={timeRange}
          onChange={(v) => setTimeRange(v ? [v[0]!, v[1]!] : null)}
        />
        <Select
          className="w-36"
          placeholder={t('common.form.pleaseSelect')}
          allowClear
          value={status}
          options={statusOptions}
          onChange={setStatus}
        />
      </section>
      <section className="grow mx-3 mb-3 flex flex-col overflow-y-hidden">
        <ScrollArea className="grow border border-solid border-ground-3 rounded">
          <XTable
            key={i18n.language}
            table={table}
            loading={isLoading || isRefetching}
          />
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
