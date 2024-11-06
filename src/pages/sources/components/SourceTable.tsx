import { StatusColorMap, StatusMap } from '@/enum/device'
import { getAllDeviceList } from '@/service/modules/device'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Badge, Button, Input, Pagination } from 'antd'
import { memo, type FC } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import OTAUpdateColumn from './OTAUpdateColumn'
import DeviceData from './DeviceData'
import XTable from '@/components/ui/XTable.tsx'
import usePageSearchParams from '@/hooks/useTableSearchParams'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import DeviceIcon from '@/components/device/DeviceIcon'

type PropsType = unknown

const columnHelper = createColumnHelper<API_DEVICE.domain.DeviceListItem>()

const defaultData = []
const SourceTable: FC<PropsType> = memo(() => {
  const [searchParams] = useSearchParams()

  const type = searchParams.get('type')
  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 20)
  const kw = searchParams.get('kw')

  const queryClient = useQueryClient()

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['getAllDeviceList', type, page, size, kw],
      queryFn: () =>
        getAllDeviceList({
          type: type!,
          deviceName: kw || undefined,
          otaInfo: true,
          isPage: true,
          page,
          size,
        }),
      select: (d) => d.data,
      enabled: !!type,
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
      columnHelper.accessor('deviceName', {
        header: '设备名称',
        cell: (cell) => (
          <div className="flex gap-2">
            <DeviceIcon type={cell?.row.original.deviceType} />
            {cell?.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('username', {
        header: '使用者',
        cell: (cell) => cell?.getValue() || '-',
      }),
      columnHelper.accessor('deviceModel', {
        header: '设备型号',
      }),
      columnHelper.accessor('otaInfo.artifactName', {
        header: '固件版本',
        cell: (cell) => cell?.getValue() || '-',
      }),
      columnHelper.accessor('otaInfo', {
        header: '固件升级',
        cell: (cell) => <OTAUpdateColumn data={cell?.row.original} />,
      }),
      columnHelper.accessor('sn', {
        header: '设备序列号',
      }),
      columnHelper.accessor('deviceId', {
        header: '设备编码',
      }),
      columnHelper.accessor('status', {
        header: '设备状态',
        cell: (cell) => {
          return (
            <Badge
              color={StatusColorMap[cell.getValue()]}
              text={
                <span className="text-white">
                  {StatusMap[cell?.getValue()]}
                </span>
              }
            />
          )
        },
      }),
      columnHelper.accessor('remainingPower', {
        header: '电量',
        cell: (cell) => {
          return <span>{cell?.getValue()}%</span>
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '操作',
        cell: (cell) => {
          const data = cell.row.original
          return (
            <div className="flex justify-center">
              <DeviceData deviceData={cell?.row.original} />
              {data.deviceType === 'UAV' && (
                <Link to={`/backtracking/device/${data.deviceId}`}>
                  <Button type="link" size="small">
                    回溯
                  </Button>
                </Link>
              )}
            </div>
          )
        },
      }),
    ]
    return columns
  }, [searchParams.get('type')])

  const table = useReactTable({
    data: data?.rows ?? defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.deviceId,
  })

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  return (
    <div className="grow mt-3 overflow-y-hidden flex flex-col">
      <div className="w-72">
        <Input.Search
          placeholder="设备名称"
          defaultValue={kw ?? undefined}
          onSearch={(e) => handleValueChange('kw', e)}
        />
      </div>
      <div className="mt-3 w-full grow rounded overflow-hidden border border-solid border-[#23272D]">
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
})

SourceTable.displayName = 'SourceTable'

export default SourceTable
