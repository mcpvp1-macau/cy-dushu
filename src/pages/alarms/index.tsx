import DateRangePicker from '@/components/AntdOverride/DateRangePicker'
import Select from '@/components/AntdOverride/Select'
import TextButton from '@/components/ui/button/TextButton'
import TagItemV2 from '@/components/ui/TagItemV2'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import XTable from '@/components/ui/XTable'
import FormModal from '@/components/XForm/Modal'
import { XFormItem } from '@/components/XForm/types'
import XModal from '@/components/XModal'
import { emtpyArray } from '@/constant/data'
import { dft } from '@/constant/time-fmt'
import { useAppMsg } from '@/hooks/useAppMsg'
import usePageSearchParams from '@/hooks/useTableSearchParams'
import {
  batchDeleteAlarms,
  batchUpdateAlarms,
  queryAlarmList,
} from '@/service/modules/db-api'
import serverJingqi from '@/service/servers/serverJingqi'
import useUserStore from '@/store/useUser.store'
import { DownloadOutlined } from '@ant-design/icons'
import { Checkbox, Input, Button, Pagination } from 'antd'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from '@tanstack/react-table'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import { useDebounceFn, useMemoizedFn } from 'ahooks'

const h = createColumnHelper<API_DBAPI.domain.AlarmRecord>()

const PageAlarms: FC = memo(() => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { handleValueChange, handlePaginationChange } = usePageSearchParams()
  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const username = useUserStore((s) => s.user?.username ?? '')
  const token = useUserStore((s) => s.token)

  const processStatus = searchParams.get('processStatus') || undefined
  const deviceName = searchParams.get('deviceName') || undefined
  const sn = searchParams.get('sn') || undefined

  const pageNum = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('size') ?? 20)

  const rangeValue = searchParams.get('startTime')
    ? ([
        dayjs(searchParams.get('startTime')),
        dayjs(searchParams.get('endTime')),
      ] as [Dayjs, Dayjs])
    : undefined

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: [
        'getAlarmList',
        {
          pageNum,
          pageSize,
          processStatus,
          deviceName,
          sn,
          rangeValue,
        },
      ],
      queryFn: () =>
        queryAlarmList({
          startTime: rangeValue?.[0]?.format(dft),
          endTime: rangeValue?.[1]?.format(dft),
          processStatus:
            processStatus as API_DBAPI.req.AlarmQueryReq['processStatus'],
          deviceName: deviceName || undefined,
          sn: sn || undefined,
          pageNum,
          pageSize,
        }),
      select: (resp) => ({
        list: resp.data?.list ?? emtpyArray,
        total: resp.data?.count?.[0]?.cnt ?? 0,
      }),
    },
    queryClient,
  )

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deleteTargets, setDeleteTargets] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingAlarm, setEditingAlarm] =
    useState<API_DBAPI.domain.AlarmRecord | null>(null)

  const processStatusOptions = useMemo(
    () => [
      { label: t('alarm.status.unprocessed'), value: 'UNPROCESSED' },
      { label: t('alarm.status.processed'), value: 'PROCESSED' },
    ],
    [t],
  )

  const processStatusLabelMap = useMemo(
    () =>
      Object.fromEntries(processStatusOptions.map((o) => [o.value, o.label])),
    [processStatusOptions],
  )

  const processStatusTagMap = useMemo(
    () => ({
      PROCESSED: { label: processStatusLabelMap.PROCESSED, type: 'success' },
      UNPROCESSED: {
        label: processStatusLabelMap.UNPROCESSED,
        type: 'warning',
      },
    }),
    [processStatusLabelMap],
  )

  const alarmLevelTagMap = useMemo(
    () => ({
      Info: { label: '普通', type: 'default' },
      Warn: { label: '警告', type: 'warning' },
      Error: { label: '严重', type: 'error' },
    }),
    [t],
  )

  const deleteMutation = useMutation({
    mutationFn: (alarmIds: string[]) =>
      batchDeleteAlarms({
        alarmIds,
      }),
    onSuccess: () => {
      msgApi.success(t('alarm.delete.success'))
      setRowSelection({})
      setDeleteTargets([])
      queryClient.invalidateQueries({ queryKey: ['getAlarmList'] })
    },
    onError: (err: any) => {
      msgApi.error(
        (err?.msg as string) || (err as Error)?.message || t('common.error'),
      )
    },
  })

  const handleDelete = useMemoizedFn((alarmIds: string[]) => {
    if (!alarmIds.length) return
    setDeleteTargets(alarmIds)
    setDeleteModalOpen(true)
  })

  const editMutation = useMutation({
    mutationFn: (payload: API_DBAPI.req.AlarmBatchUpdateReq) =>
      batchUpdateAlarms(payload),
    onSuccess: () => {
      msgApi.success(t('alarm.edit.success'))
      setEditingAlarm(null)
      queryClient.invalidateQueries({ queryKey: ['getAlarmList'] })
    },
    onError: (err: any) => {
      msgApi.error(
        (err?.msg as string) || (err as Error)?.message || t('common.error'),
      )
    },
  })

  const editFormItems = useMemo<XFormItem[]>(
    () => [
      {
        type: 'textarea',
        name: 'processMsg',
        label: t('alarm.edit.processMsg'),
        placeholder: t('alarm.edit.processMsgPlaceholder'),
        otherProps: { maxLength: 100, autoSize: { minRows: 3, maxRows: 6 } },
        rules: [
          { required: true, message: t('alarm.edit.processMsgRequired') },
        ],
      },
    ],
    [t],
  )

  const handleEditConfirm = useMemoizedFn(
    async (values: { processMsg: string }) => {
      if (!editingAlarm) return
      await editMutation.mutateAsync({
        alarmIds: [editingAlarm.alarmId],
        processUsername: username,
        isDeleted: 0,
        processMsg: values.processMsg,
      })
    },
  )

  const exportMutation = useMutation({
    mutationFn: async () => {
      const payload: API_DBAPI.req.AlarmQueryReq = {
        startTime: rangeValue?.[0]?.format(dft),
        endTime: rangeValue?.[1]?.format(dft),
        processStatus:
          processStatus as API_DBAPI.req.AlarmQueryReq['processStatus'],
        deviceName: deviceName || undefined,
        sn: sn || undefined,
        pageNum,
        pageSize,
      }

      const res = await fetch(
        `${serverJingqi.baseURL}/action/alarm/list.xlsx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) {
        throw new Error(res.statusText)
      }

      if (res.headers.get('content-type')?.includes('application/json')) {
        const json = await res.json()
        if (json.code !== 'SUCCESS') {
          throw new Error(json.message ?? t('common.error'))
        }
      }

      const blob = await res.blob()
      const objectURL = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectURL
      const startLabel = payload.startTime ?? ''
      const endLabel = payload.endTime ?? ''
      anchor.download = `Alarms_${startLabel}_${endLabel}.xlsx`
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectURL)
    },
    onError: (err: any) => {
      msgApi.error(
        err?.message || (err as Error)?.message || t('alarm.export.failed'),
      )
    },
  })

  const columns = useMemo(
    () => [
      h.display({
        id: 'select',
        size: 60,
        header: ({ table }) => (
          <Checkbox
            indeterminate={
              table.getIsSomePageRowsSelected() &&
              !table.getIsAllPageRowsSelected()
            }
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableResizing: false,
      }),
      h.accessor('time', {
        header: t('alarm.table.time'),
        size: 200,
        minSize: 180,
      }),
      h.accessor('deviceName', {
        header: t('alarm.table.deviceName'),
        size: 160,
        minSize: 140,
      }),
      h.accessor('sn', {
        header: 'SN',
        size: 140,
      }),
      h.accessor('alarmLevel', {
        header: t('alarm.table.alarmLevel'),
        size: 140,
        cell: ({ getValue }) => {
          const level = getValue()
          const meta = level
            ? alarmLevelTagMap[level as keyof typeof alarmLevelTagMap]
            : undefined
          return (
            <TagItemV2 type={meta?.type ?? 'default'}>
              {meta?.label ?? level ?? '--'}
            </TagItemV2>
          )
        },
      }),
      h.accessor('msg', {
        header: t('alarm.table.msg'),
        size: 320,
        minSize: 260,
      }),
      h.accessor('processStatus', {
        header: t('alarm.table.processStatus'),
        size: 140,
        cell: ({ getValue }) => {
          const status = getValue()
          const meta = processStatusTagMap[status]
          return (
            <TagItemV2 type={meta?.type ?? 'default'}>
              {meta?.label ?? status ?? '--'}
            </TagItemV2>
          )
        },
      }),
      h.accessor('processUsername', {
        header: t('alarm.table.processUsername'),
        size: 160,
      }),
      h.accessor('processTime', {
        header: t('alarm.table.processTime'),
        size: 180,
      }),
      h.accessor('processMsg', {
        header: t('alarm.table.processMsg'),
        size: 200,
      }),
      h.display({
        id: 'actions',
        header: t('common.operation'),
        size: 120,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <TextButton
              onClick={() => setEditingAlarm(row.original)}
              disabled={
                editMutation.isPending &&
                editingAlarm?.alarmId === row.original.alarmId
              }
            >
              {t('common.resolve')}
            </TextButton>
            <TextButton
              danger
              onClick={() => handleDelete([row.original.alarmId])}
            >
              {t('common.delete')}
            </TextButton>
          </div>
        ),
      }),
    ],
    [
      alarmLevelTagMap,
      editMutation.isPending,
      editingAlarm?.alarmId,
      handleDelete,
      processStatusTagMap,
      t,
    ],
  )

  const table = useReactTable<API_DBAPI.domain.AlarmRecord>({
    columns,
    data: data?.list ?? emtpyArray,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.alarmId),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  })

  const selectedAlarms = useMemo(
    () => table.getSelectedRowModel().rows.map((r) => r.original),
    [rowSelection, table],
  )

  const { run: debouncedHandleValueChange } = useDebounceFn(handleValueChange, {
    wait: 500,
  })

  return (
    <div className="page-full p-3 bg-ground-2 flex flex-col overflow-y-hidden">
      <h2 className="text-white">{t('alarm.title')}</h2>
      <section className="mt-3 flex flex-wrap gap-2 items-center">
        <DateRangePicker
          showTime
          defaultValue={rangeValue}
          onChange={(d) => {
            setSearchParams(
              {
                ...Object.fromEntries(searchParams.entries()),
                startTime: d?.[0]?.format(dft) ?? '',
                endTime: d?.[1]?.format(dft) ?? '',
              },
              { replace: true },
            )
          }}
        />
        <Select
          options={processStatusOptions}
          allowClear
          className="w-44"
          placeholder={t('alarm.filters.processStatus')}
          value={processStatus ?? undefined}
          onChange={(v) => handleValueChange('processStatus', v || null)}
        />
        <Input
          allowClear
          className="w-52"
          defaultValue={deviceName}
          placeholder={t('alarm.filters.deviceName')}
          onChange={(e) =>
            debouncedHandleValueChange('deviceName', e.target.value)
          }
        />
        <Input
          allowClear
          className="w-52"
          defaultValue={sn}
          placeholder={t('alarm.filters.sn')}
          onChange={(e) => debouncedHandleValueChange('sn', e.target.value)}
        />
        <Button
          icon={<DownloadOutlined />}
          loading={exportMutation.isPending}
          onClick={() => exportMutation.mutate()}
        >
          {t('common.export')}
        </Button>
        <Button
          type="primary"
          danger
          disabled={!selectedAlarms.length}
          loading={deleteMutation.isPending}
          onClick={() =>
            handleDelete(selectedAlarms.map((item) => item.alarmId))
          }
        >
          {t('alarm.delete.batch')}
        </Button>
      </section>
      <section className="mt-3 grow flex flex-col overflow-hidden">
        <div className="flex-1 border border-solid border-ground-1 rounded-[3px] overflow-hidden">
          <ScrollArea className="size-full x-table">
            <XTable
              table={table}
              loading={isLoading || isRefetching || deleteMutation.isPending}
            />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="flex justify-end">
          <Pagination
            className="mt-2"
            current={pageNum}
            pageSize={pageSize}
            total={data?.total ?? 0}
            onChange={handlePaginationChange}
          />
        </div>
      </section>

      {deleteModalOpen ? (
        <XModal
          title={t('alarm.delete.confirmTitle')}
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deleteTargets)
            setDeleteModalOpen(false)
          }}
          confirmLoading={deleteMutation.isPending}
          confirmTitle={t('common.delete')}
          confirmDisable={!deleteTargets.length}
        >
          <div className="text-sm text-fore">
            {t('alarm.delete.confirmContent', { count: deleteTargets.length })}
          </div>
        </XModal>
      ) : null}

      {editingAlarm ? (
        <FormModal
          title={t('alarm.edit.title')}
          open={!!editingAlarm}
          items={editFormItems}
          onClose={() => setEditingAlarm(null)}
          onConfirm={handleEditConfirm}
          confirmLoading={editMutation.isPending}
          initialValues={{ processMsg: editingAlarm.processMsg ?? '' }}
        />
      ) : null}
    </div>
  )
})

PageAlarms.displayName = 'PageAlarms'

export default PageAlarms
