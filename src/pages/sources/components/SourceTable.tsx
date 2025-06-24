import { StatusColorMap } from '@/enum/device'
import { getAllDeviceList, getUavDocSnList } from '@/service/modules/device'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Badge, Button, Input, Pagination } from 'antd'
import { Link, useSearchParams } from 'react-router-dom'
import OTAUpdateColumn from './OTAUpdateColumn'
import DeviceData from './DeviceData'
import XTable from '@/components/ui/XTable.tsx'
import usePageSearchParams from '@/hooks/useTableSearchParams'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import DeviceIcon from '@/components/device/DeviceIcon'
import TextButton from '@/components/ui/button/TextButton'
import UavDetail from './UavDetail'
import Logs from './Logs'
import UploadDetail from './UavDetail/UploadDetail'

type PropsType = unknown

const columnHelper = createColumnHelper<API_DEVICE.domain.DeviceListItem>()

const defaultData = []

const backtrackingDeviceType = ['UAV', 'WANGLOU']
const SourceTable: FC<PropsType> = memo(() => {
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()

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

  const { data: uavDocSnList = [] } = useQuery(
    {
      queryKey: ['getUavDocSnList'],
      queryFn: async () => {
        const res = await getUavDocSnList()
        return res.data || []
      },
    },
    queryClient,
  )

  const uavDocSnSet = useMemo(() => {
    return new Set(uavDocSnList)
  }, [uavDocSnList])

  const columns = useMemo(() => {
    const columns = [
      columnHelper.accessor('deviceName', {
        header: t('resource.table.deviceName.title'),
        cell: (cell) => (
          <div className="flex gap-2">
            <DeviceIcon
              type={cell?.row.original.deviceType}
              className="text-primary"
            />
            {cell?.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('username', {
        header: t('resource.table.username.title'),
        cell: (cell) => cell?.getValue() || '-',
      }),
      columnHelper.accessor('deviceModel', {
        header: t('resource.table.deviceModel.title'),
      }),
      columnHelper.accessor('otaInfo.artifactName', {
        header: t('resource.table.otaInfo.title'),
        cell: (cell) => cell?.getValue() || '-',
      }),
      columnHelper.accessor('otaInfo', {
        header: t('resource.table.otaUpgrade.title'),
        cell: (cell) => <OTAUpdateColumn data={cell?.row.original} />,
      }),
      columnHelper.accessor('sn', {
        header: t('resource.table.sn.title'),
      }),
      columnHelper.accessor('deviceId', {
        header: t('resource.table.deviceId.title'),
      }),
      columnHelper.accessor('status', {
        header: t('common.onlineStatus'),
        cell: (cell) => {
          return (
            <Badge
              color={StatusColorMap[cell.getValue()]}
              text={
                <span className="text-white">
                  {/* {StatusMap[cell?.getValue()]} */}
                  {cell?.getValue()
                    ? t(`device.status.online.${cell?.getValue()}`)
                    : '-'}
                </span>
              }
            />
          )
        },
      }),
      columnHelper.accessor('remainingPower', {
        header: t('common.electricity'),
        cell: (cell) => {
          return <span>{cell?.getValue()}%</span>
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: t('common.operation'),
        cell: (cell) => {
          const data = cell.row.original
          return (
            <div className="flex gap-3">
              <DeviceData deviceData={cell?.row.original} />
              {globalConfig.isHaveBacktracking ? (
                <>
                  {backtrackingDeviceType.includes(data.deviceType) && (
                    <Link to={`/backtracking/device/${data.deviceId}`}>
                      <TextButton>{t('common.backTracking')}</TextButton>
                    </Link>
                  )}
                </>
              ) : null}
              {(data.deviceType === 'UAV' ||
                data.deviceType === 'UAV_AIRPORT') &&
                uavDocSnSet.has(data.sn) && <UavDetail sn={data.sn} />}
              {(data.deviceType === 'UAV' ||
                data.deviceType === 'UAV_AIRPORT') && (
                <Logs deviceId={data.deviceId} />
              )}
            </div>
          )
        },
      }),
    ]
    return columns
  }, [i18n.language, searchParams.get('type')])

  const table = useReactTable({
    data: data?.rows ?? defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.deviceId,
  })

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  return (
    <div className="grow mt-3 overflow-y-hidden flex flex-col">
      <div className="flex gap-3 items-center">
        <Input.Search
          placeholder={t('resource.table.deviceName.title')}
          defaultValue={kw ?? undefined}
          onSearch={(e) => handleValueChange('kw', e)}
          className="w-72"
        />
        {globalConfig.useUavAirportDoc &&
          (type === 'UAV_AIRPORT' || type === 'UAV') && <UploadDetail />}
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
