import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import XTable from '@/components/ui/XTable.tsx'
import { emtpyArray } from '@/constant/data'
import { dft } from '@/constant/time-fmt'
import usePageSearchParams from '@/hooks/useTableSearchParams'
import { getActionRecordList } from '@/service/modules/action'
import serverJingqi from '@/service/servers/serverJingqi'
import useUserStore from '@/store/useUser.store'
import { downloadAndRename } from '@/utils/download'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button, DatePicker, Input, Pagination } from 'antd'
import { Dayjs } from 'dayjs'
import { memo, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'

type PropsType = unknown

const h = createColumnHelper<API_ACTION.domain.ActionRecord>()

const PageActionRecord: FC<PropsType> = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams()

  const kw = searchParams.get('kw') || undefined

  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 30)

  const rangeValue = searchParams.get('startTime')
    ? ([
        dayjs(searchParams.get('startTime')),
        dayjs(searchParams.get('endTime')),
      ] as [Dayjs, Dayjs])
    : undefined

  const queryClient = useQueryClient()

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['getActionRecordList', { page, size, kw }],
      queryFn: () =>
        getActionRecordList({
          name: kw,
          isPage: true,
          page,
          size,
          startTime: rangeValue?.[0].startOf('day').format(dft),
          endTime: rangeValue?.[1].endOf('day').format(dft),
        }),
      select: (d) => d.data,
    },
    queryClient,
  )

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  const columns = useMemo(
    () => [
      h.accessor('name', {
        header: '行动名称',
        maxSize: 200,
        size: 200,
        minSize: 200,
        cell: (r) => (
          <div className="flex gap-2">
            <MenuIconAction className="text-primary" />
            <span className="truncate">{r.getValue()}</span>
          </div>
        ),
      }),
      h.accessor('startTime', {
        header: '开始时间',
        minSize: 200,
        maxSize: 500,
      }),
      h.accessor('endTime', {
        header: '结束时间',
        minSize: 200,
        maxSize: 500,
      }),
      h.accessor('description', {
        header: '描述',
        minSize: 200,
        maxSize: 500,
      }),
      h.display({
        id: 'actions',
        header: '操作',
        cell: (cell) => {
          const item = cell.row.original
          return (
            <div>
              <Button type="link">回溯</Button>
              <Button
                type="link"
                onClick={() =>
                  downloadAndRename(
                    `${serverJingqi.baseURL}/action/signal/${item.actionId}/record.csv`,
                    `${item.name}_信号记录.csv`,
                    {
                      Authorization: `Bearer ${useUserStore.getState().token}`,
                    },
                  )
                }
              >
                信号下载
              </Button>
            </div>
          )
        },
      }),
    ],
    [],
  )

  const table = useReactTable<API_ACTION.domain.ActionRecord>({
    columns: columns,
    data: data?.rows ?? emtpyArray,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (r) => String(r.actionId),
  })

  return (
    <div className="page-full p-3 bg-ground-180 flex flex-col overflow-y-hidden">
      <h2 className="text-white">行动记录</h2>
      <section className="mt-3 flex gap-2">
        <Input.Search
          defaultValue={kw}
          placeholder="行动名称"
          className="w-56"
          onSearch={(e) => handleValueChange('kw', e)}
        />
        <DatePicker.RangePicker
          defaultValue={rangeValue}
          onChange={(d) => {
            setSearchParams({
              ...Object.fromEntries(searchParams.entries()),
              startTime: d?.[0]?.format('YYYY-MM-DD') ?? '',
              endTime: d?.[1]?.format('YYYY-MM-DD') ?? '',
            })
          }}
        />
      </section>
      <section className="mt-3 grow flex flex-col overflow-hidden">
        <div className="flex-1 border border-solid border-ground-100 rounded-[3px] overflow-hidden">
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

PageActionRecord.displayName = 'PageActionRecord'

export default PageActionRecord
