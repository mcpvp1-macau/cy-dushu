import MenuIconEvents from '@/assets/icons/jsx/menus/MenuIconEvents'
import Select from '@/components/AntdOverride/Select'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import XTable from '@/components/ui/XTable'
import { emtpyArray } from '@/constant/data'
import { dft } from '@/constant/time-fmt'
import { EventStatusMap } from '@/enum/event'
import usePageSearchParams from '@/hooks/useTableSearchParams'
import { getEventList } from '@/service/modules/events'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DatePicker, Input, Pagination } from 'antd'
import type { Dayjs } from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import useEventTypeOptions from './hooks/useEventTypeOptions'
import EventDetailModal from './components/EventDetailModal'

const h = createColumnHelper<API_EVENTS.domain.Event>()

type PropsType = unknown

const PageEvents: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const kw = searchParams.get('kw') || undefined

  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 30)

  const status = searchParams.get('status') || undefined
  const eventType = searchParams.get('eventType') || undefined

  const rangeValue = searchParams.get('startTime')
    ? ([
        dayjs(searchParams.get('startTime')),
        dayjs(searchParams.get('endTime')),
      ] as [Dayjs, Dayjs])
    : undefined

  const eventStatusOptions = useMemo(
    () =>
      Object.values(EventStatusMap).map((e) => ({
        label: t(`events.status.${e.key}.title`),
        value: e.key,
      })),
    [],
  )

  const eventTypeOptions = useEventTypeOptions()

  const queryClient = useQueryClient()

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: [
        'getEventList',
        { page, size, kw, rangeValue, status, eventType },
      ],
      queryFn: () =>
        getEventList({
          eventName: kw,
          isPage: true,
          page,
          size,
          eventType,
          beginTime: rangeValue?.[0].startOf('day').format(dft),
          endTime: rangeValue?.[1].endOf('day').format(dft),
          processStatusList: status ? [status] : undefined,
        }),
      select: (d) => d.data,
    },
    queryClient,
  )

  const columns = useMemo(
    () => [
      h.accessor('eventName', {
        header: t('events.table.eventName.title'),
        maxSize: 200,
        size: 200,
        minSize: 200,
        cell: (r) => (
          <div className="flex gap-2">
            <MenuIconEvents className="text-primary" />
            <span className="truncate">{r.getValue()}</span>
          </div>
        ),
      }),
      h.accessor('eventTime', {
        header: t('events.table.eventTime.title'),
        minSize: 200,
        maxSize: 500,
      }),
      h.accessor('startTime', {
        header: t('events.table.endTime.title'),
        minSize: 200,
        maxSize: 500,
        cell: (r) => {
          return r.getValue() || '-'
        },
      }),
      h.accessor('processStatus', {
        header: t('events.table.processStatus.title'),
        minSize: 200,
        maxSize: 300,
        cell: (r) => {
          const e = EventStatusMap[r.getValue()]
          if (!e) {
            return '-'
          }
          return (
            <span style={{ color: e.textColor ?? '#fff' }}>
              {t(`events.status.${e.key}.title`) || '-'}
            </span>
          )
        },
      }),
      h.display({
        id: 'actions',
        header: t('common.operation'),
        cell: (cell) => {
          return <EventDetailModal data={cell.row.original} />
        },
      }),
    ],
    [t],
  )

  const table = useReactTable<API_EVENTS.domain.Event>({
    columns: columns,
    data: data?.rows ?? emtpyArray,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (r) => String(r.eventId),
  })

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  return (
    <div className="page-full p-3 bg-ground-2 flex flex-col overflow-y-hidden">
      <h2 className="text-white">{t('events.title')}</h2>
      <section className="mt-3 flex gap-2">
        <Input.Search
          defaultValue={kw}
          placeholder={t('events.search.placeholder')}
          className="w-56"
          onSearch={(e) => handleValueChange('kw', e)}
        />
        <DatePicker.RangePicker
          defaultValue={rangeValue}
          onChange={(d) => {
            setSearchParams(
              {
                ...Object.fromEntries(searchParams.entries()),
                startTime: d?.[0]?.format('YYYY-MM-DD') ?? '',
                endTime: d?.[1]?.format('YYYY-MM-DD') ?? '',
              },
              { replace: true },
            )
          }}
        />
        <Select
          placeholder={t('events.filter.type.title')}
          className="w-56"
          defaultValue={eventType}
          options={eventTypeOptions}
          allowClear
          onChange={(v) => handleValueChange('eventType', v)}
        />
        <Select
          placeholder={t('events.filter.status.title')}
          className="w-56"
          defaultValue={status}
          options={eventStatusOptions}
          allowClear
          onChange={(v) => handleValueChange('status', v)}
        />
      </section>
      <section className="mt-3 grow flex flex-col overflow-hidden">
        <div className="flex-1 border border-solid border-ground-1 rounded-[3px] overflow-hidden">
          <ScrollArea className="size-full x-table">
            <XTable table={table} loading={isLoading || isRefetching} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="flex justify-end">
          <Pagination
            className="mt-2"
            current={page}
            pageSize={size}
            total={data?.total ?? 0}
            onChange={handlePaginationChange}
          />
        </div>
      </section>
    </div>
  )
})

PageEvents.displayName = 'PageEvents'

export default PageEvents
