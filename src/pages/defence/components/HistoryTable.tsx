import {Input, Pagination} from 'antd'
import { getDefenseOverlayHistory } from '@/service/modules/layer_overlay'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import XTable from '@/components/ui/XTable'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useSearchParams } from 'react-router-dom'
import usePageSearchParams from '@/hooks/useTableSearchParams'

type SourceTablesProp = {}

const columnHelper = createColumnHelper<any>()

const HistoryTable: React.FC<SourceTablesProp> = (_props) => {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 20)
  const overlayName = searchParams.get('overlayName') || undefined

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['getDefenseOverlayHistory', overlayName, page, size],
      queryFn: () =>
        getDefenseOverlayHistory({
          isPage: true,
          page,
          size,
          overlayName,
        }),
      select: (d) => d.data,
      // 保留上一次的 total
      placeholderData: (e) => {
        return {
          code: 'SUCCESS',
          message: '?',
          data: {
            rows: [],
            total: e?.data?.total || 0,
          },
        }
      },
    },
    queryClient,
  )

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor('overlayName', {
        header: '布防区域',
      }),
      columnHelper.accessor('startTime', {
        header: '布防时间',
      }),
      columnHelper.accessor('endTime', {
        header: '撤防时间',
      }),
    ]
    return columns
  }, [])

  const table = useReactTable({
    data: data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  return (
    <div className="grow mt-3 overflow-y-hidden flex flex-col">
      <div className="w-72">
        <Input.Search
          placeholder="区域名称"
          onSearch={(e) => handleValueChange('overlayName', e)}
        />
      </div>
      <div className="mt-3 w-full grow rounded overflow-hidden border border-solid border-ground-3">
        <ScrollArea className="h-full">
          <XTable table={table} loading={isLoading || isRefetching} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <div className="mt-1 flex justify-end">
        <Pagination
          pageSize={size}
          showSizeChanger
          current={page}
          total={data?.total}
          onChange={handlePaginationChange}
        />
      </div>
    </div>
  )
}

export default HistoryTable
