import { StatusColorMap } from '@/enum/device'
import { getAllDeviceListOta, getUavDocSnList } from '@/service/modules/device'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { Badge, Input, Pagination, Radio } from 'antd'
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
import { useDebounceFn, useLocalStorageState } from 'ahooks'
import TaskCapabilityColumn from './TaskCapabilityColumn'

type PropsType = unknown

const columnHelper = createColumnHelper<API_DEVICE.domain.DeviceOTAItem>()

const defaultData = []

const backtrackingDeviceType = ['UAV', 'WANGLOU']
const SourceTable: FC<PropsType> = memo(() => {
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()

  const type = searchParams.get('type')
  const page = Number(searchParams.get('page') ?? 1)
  const size = Number(searchParams.get('size') ?? 20)
  const kw = searchParams.get('kw')
  const sn = searchParams.get('sn')

  const [refreshKey, setRefreshKey] = useState(0)

  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  )
  const [djiOtaInfoFilter, setDjiOtaInfoFilter] = useState<string>('ALL')

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    useLocalStorageState<VisibilityState>('source-columnVisibility', {
      defaultValue: {
        deviceName: true,
        deviceModel: true,
        sn: true,
        deviceId: true,
        status: true,
        remainingPower: true,
        actions: true,
        'djiOtaInfo.firmwareVersion': true,
        djiOtaInfo: true,
      },
    })

  const paramsMap = {
    status: 'deviceStatus',
    djiOtaInfo: 'djiOtaStatus',
    // otaInfo: 'otaStatus',
  }
  const parmas = useMemo(() => {
    const params = {}
    columnFilters.forEach((filter) => {
      if (filter.value) {
        params[paramsMap[filter.id]] = filter.value
      }
    })
    return params
  }, [columnFilters])

  const queryClient = useQueryClient()

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: [
        'getAllDeviceListTable',
        type,
        page,
        size,
        kw,
        sn,
        parmas,
        refreshKey,
      ],
      queryFn: () =>
        getAllDeviceListOta({
          type: type!,
          deviceName: kw || undefined,
          sn: sn || undefined,
          otaInfo: true,
          isPage: true,
          page,
          size,
          ...parmas,
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
    const isUavType = type === 'UAV' || type === 'UAV_AIRPORT'

    const columns: (ColumnDef<API_DEVICE.domain.DeviceOTAItem, any> | null)[] =
      [
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
          enableHiding: false,
        }),
        // columnHelper.accessor('username', {
        //   header: t('resource.table.username.title'),
        //   cell: (cell) => cell?.getValue() || '-',
        // }),
        columnHelper.accessor('deviceModel', {
          header: t('resource.table.deviceModel.title'),
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
                  <span className="text-hightlight">
                    {/* {StatusMap[cell?.getValue()]} */}
                    {cell?.getValue()
                      ? t(`device.status.online.${cell?.getValue()}`)
                      : '-'}
                  </span>
                }
              />
            )
          },
          enableColumnFilter: true,
          meta: {
            filterRender: (column) => {
              return (
                <Radio.Group
                  onChange={(e) => {
                    column.setFilterValue(e.target.value)
                    setStatusFilter(e.target.value)
                  }}
                  // value={column.getFilterValue() ?? undefined}
                  value={statusFilter ?? undefined}
                  className="flex flex-col gap-2"
                >
                  <Radio value={undefined}>全部</Radio>
                  <Radio value="ONLINE">在线</Radio>
                  <Radio value="OFFLINE">离线</Radio>
                </Radio.Group>
              )
            },
          },
        }),
        columnHelper.accessor('remainingPower', {
          header: t('common.electricity'),
          cell: (cell) => {
            return <span>{cell?.getValue()}%</span>
          },
          enableColumnFilter: false,
        }),
        // 演示模式: 无人机类目展示可执行任务类型
        globalConfig.demoMode && type === 'UAV'
          ? columnHelper.display({
              id: 'taskCapability',
              header: '可执行任务类型',
              cell: (cell) => (
                <TaskCapabilityColumn deviceId={cell.row.original.deviceId} />
              ),
            })
          : null,
        isUavType
          ? columnHelper.accessor('djiOtaInfo.firmwareVersion', {
              header: t('resource.table.otaInfo.title'),
              cell: (cell) =>
                cell?.row.original.djiOtaInfo?.firmwareVersion
                  ? cell?.row.original.djiOtaInfo?.firmwareVersion
                  : '-',
            })
          : null,
        isUavType
          ? columnHelper.accessor('djiOtaInfo', {
              header: '固件升级',
              cell: (cell) => (
                <OTAUpdateColumn
                  data={cell?.row.original}
                  type="DJI"
                  onRefresh={() => {
                    // queryClient.invalidateQueries({
                    //   queryKey: ['getAllDeviceListTable'],
                    // })
                    setRefreshKey((v) => v + 1)
                  }}
                />
              ),
              enableColumnFilter: true,
              meta: {
                filterRender: (column) => {
                  return (
                    <Radio.Group
                      onChange={(e) => {
                        column.setFilterValue(e.target.value)
                        setDjiOtaInfoFilter(e.target.value)
                      }}
                      value={djiOtaInfoFilter ?? 'ALL'}
                      className="flex flex-col gap-2"
                    >
                      <Radio value="ALL">全部</Radio>
                      <Radio value="UPGRADE">需升级</Radio>
                      <Radio value="NO_UPGRADE">无需升级</Radio>
                    </Radio.Group>
                  )
                },
              },
            })
          : null,
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
                        <div className="text-fore">
                          <TextButton>{t('common.backTracking')}</TextButton>
                        </div>
                      </Link>
                    )}
                  </>
                ) : null}
                {(data.deviceType === 'UAV' ||
                  data.deviceType === 'UAV_AIRPORT') &&
                  // 如果配置了使用一机一档, 则显示一机一档详情, 否则不显示
                  uavDocSnSet.has(data.sn) &&
                  // 如果配置了使用一机一档, 则显示一机一档详情, 否则不显示
                  globalConfig.useUavAirportDoc && <UavDetail sn={data.sn} />}
                {/* 日志 */}
                {(data.deviceType === 'UAV' ||
                  data.deviceType === 'UAV_AIRPORT') &&
                  globalConfig.useUavLogs && (
                    <Logs
                      deviceId={data.deviceId}
                      deviceName={data.deviceName}
                    />
                  )}
              </div>
            )
          },
        }),
      ]
    return columns.filter(Boolean) as ColumnDef<
      API_DEVICE.domain.DeviceOTAItem,
      any
    >[]
  }, [
    i18n.language,
    searchParams.get('type'),
    uavDocSnSet,
    statusFilter,
    djiOtaInfoFilter,
  ])

  const table = useReactTable({
    data: data?.rows ?? defaultData,
    columns: columns.map((column) => ({
      ...column,
      enableColumnFilter: column.enableColumnFilter ?? false,
    })),
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.deviceId,
    manualFiltering: true,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters: [{ id: 'status', value: 'ONLINE' }],
      columnVisibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: (updaterOrValue) => {
      if (typeof updaterOrValue === 'function') {
        setColumnVisibility(
          updaterOrValue as (
            prev: VisibilityState | undefined,
          ) => VisibilityState,
        )
      } else {
        setColumnVisibility(updaterOrValue)
      }
    },
  })

  // 切换类型时, 清空过滤条件
  useEffect(() => {
    setColumnFilters([])
    setStatusFilter(undefined)
  }, [type])

  const upgradeStatus = ['PENDING', 'DOWNLOADING', 'INSTALLING', 'REBOOTING']

  const refetchTimer = useRef<NodeJS.Timeout | null>(null)

  // 如果存在正在升级的设备, 则定时刷新
  useEffect(() => {
    const isNeedRefetch = data?.rows.some((row) => {
      return (
        row.djiOtaInfo?.djiOtaStatus === 'UPGRADING' ||
        upgradeStatus.includes(row.otaInfo?.status || '-')
      )
    })
    if (isNeedRefetch) {
      if (refetchTimer.current) {
        clearTimeout(refetchTimer.current)
        refetchTimer.current = null
      }
      refetchTimer.current = setTimeout(() => {
        // refetch()
        setRefreshKey((v) => v + 1)
      }, 10000)
      // refetch()
    }
  }, [data?.rows])

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  const { run: debouncedHandleValueChange } = useDebounceFn(handleValueChange, {
    wait: 500,
  })

  return (
    <div className="grow mt-3 overflow-y-hidden flex flex-col">
      <div className="flex gap-3 items-center">
        <Input
          placeholder={t('resource.table.deviceName.title')}
          defaultValue={kw ?? undefined}
          allowClear
          onChange={(e) => debouncedHandleValueChange('kw', e.target.value)}
          className="w-72"
        />
        <Input
          placeholder={'设备序列号'}
          defaultValue={sn ?? undefined}
          allowClear
          onChange={(e) => debouncedHandleValueChange('sn', e.target.value)}
          className="w-72"
        />
        {globalConfig.useUavAirportDocUpload &&
          (type === 'UAV_AIRPORT' || type === 'UAV') && <UploadDetail />}
      </div>
      <div className="mt-3 w-full grow rounded overflow-hidden border border-solid border-ground-3">
        <ScrollArea className="h-full">
          <XTable
            key={refreshKey}
            table={table}
            loading={isLoading || isRefetching}
            render={data?.rows}
          />
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
