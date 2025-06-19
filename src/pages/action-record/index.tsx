import MenuIconAction from '@/assets/icons/jsx/menus/MenuIconAction'
import Select from '@/components/AntdOverride/Select'
import TextButton from '@/components/ui/button/TextButton'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import XTable from '@/components/ui/XTable.tsx'
import { emtpyArray } from '@/constant/data'
import { dft } from '@/constant/time-fmt'
import { DictEnum } from '@/enum/dict'
import usePageSearchParams from '@/hooks/useTableSearchParams'
import { getActionRecordList } from '@/service/modules/action'
import serverJingqi from '@/service/servers/serverJingqi'
import { useDictOptions } from '@/store/useDict.store'
import useUserStore from '@/store/useUser.store'
import { downloadAndRename } from '@/utils/download'
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DatePicker, Input, Pagination } from 'antd'
import { Dayjs } from 'dayjs'
import { Link, useSearchParams } from 'react-router-dom'

type PropsType = unknown

const h = createColumnHelper<API_ACTION.domain.ActionRecord>()

const PageActionRecord: FC<PropsType> = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()

  const kw = searchParams.get('kw') || undefined
  const type = searchParams.get('type') || undefined

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
      queryKey: ['getActionRecordList', { page, size, kw, type, rangeValue }],
      queryFn: () =>
        getActionRecordList({
          name: kw,
          isPage: true,
          page,
          size,
          type,
          startTime: rangeValue?.[0].startOf('day').format(dft),
          endTime: rangeValue?.[1].endOf('day').format(dft),
        }),
      select: (d) => d.data,
    },
    queryClient,
  )

  const { handleValueChange, handlePaginationChange } = usePageSearchParams()

  const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)

  const actionTypeMap = useMemo(
    () => Object.fromEntries(actionTypeOptions.map((o) => [o.value, o.label])),
    [actionTypeOptions],
  )

  const columns = useMemo(
    () => [
      h.accessor('name', {
        header: t('actionRecord.table.actionName.title'),
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
      h.accessor('type', {
        header: t('action.add.form.type.label'),
        cell: (r) => {
          const value = r.getValue()
          return actionTypeMap[value] ?? value
        },
      }),
      h.accessor('startTime', {
        header: t('common.startTime'),
        minSize: 200,
        maxSize: 200,
      }),
      h.accessor('endTime', {
        header: t('common.endTime'),
        minSize: 200,
        maxSize: 200,
      }),
      h.accessor('description', {
        header: t('common.description'),
        minSize: 200,
        maxSize: 500,
      }),
      h.display({
        id: 'actions',
        header: t('common.operation'),
        cell: (cell) => {
          const item = cell.row.original
          return (
            <div className="flex gap-3">
              {globalConfig.isHaveBacktracking ? (
                <Link
                  to={`/backtracking/action/${item.actionId}/${item.startTime}/${item.endTime}`}
                >
                  <TextButton>{t('common.backTracking')}</TextButton>
                </Link>
              ) : null}
              <TextButton
                onClick={() =>
                  downloadAndRename(
                    `${serverJingqi.baseURL}/action/signal/${item.actionId}/record.csv`,
                    `${item.name}_Signal_Records.csv`,
                    {
                      Authorization: `Bearer ${useUserStore.getState().token}`,
                    },
                  )
                }
              >
                {t('actionRecord.signalDownload.title')}
              </TextButton>
            </div>
          )
        },
      }),
    ],
    [t, actionTypeMap],
  )

  const table = useReactTable<API_ACTION.domain.ActionRecord>({
    columns,
    data: data?.rows ?? emtpyArray,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (r) => String(r.id),
  })

  return (
    <div className="page-full p-3 bg-ground-2 flex flex-col overflow-y-hidden">
      <h2 className="text-white">{t('actionRecord.title')}</h2>
      <section className="mt-3 flex gap-2">
        <Input.Search
          defaultValue={kw}
          placeholder={t('actionRecord.table.actionName.title')}
          className="w-56"
          onSearch={(e) => handleValueChange('kw', e)}
        />
        <Select
          options={actionTypeOptions}
          className="w-56"
          placeholder={t('action.add.form.type.label')}
          allowClear
          onChange={(v) => {
            setSearchParams(
              {
                ...Object.fromEntries(searchParams.entries()),
                type: v ?? '',
              },
              { replace: true },
            )
          }}
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
      </section>
      <section className="mt-3 grow flex flex-col overflow-hidden">
        <div className="flex-1 border border-solid border-ground-1 rounded-[3px] overflow-hidden">
          <ScrollArea className="size-full x-table">
            <XTable
              table={table}
              loading={isLoading || isRefetching}
              render={columns}
            />
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
