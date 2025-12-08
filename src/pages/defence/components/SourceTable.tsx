import {Input, Button, Pagination} from 'antd'
import {getDefenseOverlay} from '@/service/modules/layer_overlay'
//   import AddDefence from '../AddDefence';
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

const SourceTable: React.FC<SourceTablesProp> = (_props) => {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 20)
  const overlayName = searchParams.get('overlayName') || undefined

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['getDefenseOverlay', overlayName],
      queryFn: () =>
        getDefenseOverlay({
          overlayName,
          defenseStatus: 1,
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

  const undefenceOverlay = (_overlay) => {
    //   setModalType('DelModal');
    //   setModalInfo({
    //     title: `撤防${overlay.overlayName}`,
    //     content: `是否要撤防${overlay.overlayName}区域？`,
    //     onFinish: async () => {
    //       const { code, message: msg } = await undefence(overlay.overlayId);
    //       if (code === 'SUCCESS') {
    //         refresh();
    //         setModalType('');
    //         msgApi.success(msg);
    //       } else {
    //         msgApi.error(msg);
    //       }
    //     },
    //     onCancel: () => {
    //       setModalType('');
    //     },
    //   });
  }

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor('overlayName', {
        header: '布防区域',
      }),
      columnHelper.accessor('gmtDefense', {
        header: '布防时间',
      }),
      columnHelper.display({
        id: 'actions',
        header: '操作',
        cell: (cell) => {
          const data = cell.row.original
          return (
            <div className="flex justify-center">
              <Button
                danger
                type="link"
                style={{ padding: 0 }}
                onClick={() => undefenceOverlay(data)}
              >
                撤防
              </Button>
            </div>
          )
        },
      }),
    ]
    return columns
  }, [])

  const getSizeData = (rows) => {
    if (Array.isArray(rows)) {
      return rows.filter((item, index) => {
        return index > page * size && index < (page + 1) * size
      })
    }

    return []
  }
  const table = useReactTable({
    data: getSizeData(data?.rows) ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.overlayId,
  })

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  return (
    <div className="grow mt-3 overflow-y-hidden flex flex-col">
      <div className="w-72">
        <Input.Search
          placeholder="设备名称"
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

export default SourceTable
