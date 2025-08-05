import ScheduleListItem, { StatusList } from './ScheduleItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import ScheduleModal from './ScheduleModal'
import { Button, Input, Spin } from 'antd'
import { addActionPlan, getActionPlanList } from '@/service/modules/action-plan'
import AppSpin from '@/components/AppSpin'
import { useAppMsg } from '@/hooks/useAppMsg'
import AppEmpty from '@/components/AppEmpty'
import MenuIconSchedule from '@/assets/icons/jsx/menus/MenuIconSchedule'
import Select from '@/components/AntdOverride/Select'
import { useSearchParams } from 'react-router-dom'

type PropsType = unknown

const ScheduleList: FC<PropsType> = memo(() => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [searchParams, setSearchParams] = useSearchParams()
  const kw = searchParams.get('kw') || undefined
  const status = searchParams.get('status') || undefined

  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['getActionPlanList', { kw, status }],
      queryFn: () => getActionPlanList({ actionPlanName: kw, status }),
      select: (d) => d.data.rows,
    },
    queryClient,
  )

  const msgApi = useAppMsg()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleAdd = async (data: API_ACTION_PLAN.domain.Plan) => {
    try {
      setLoading(true)
      await addActionPlan(data)
      msgApi.success(t('api.success.msg'))
      queryClient.invalidateQueries({
        queryKey: ['getActionPlanList'],
      })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    if (value) {
      searchParams.set('kw', value)
    } else {
      searchParams.delete('kw')
    }
    setSearchParams(searchParams, { replace: true })
  }

  return (
    <div className="h-full min-w-[350px] w-[350px] border-r border-solid border-ground-4 flex flex-col">
      <header className="flex justify-between items-center p-3 border-b border-solid border-ground-4">
        <div className="flex gap-1">
          <MenuIconSchedule />
          <h2 className="text-white">{t('schedue.list.title')}</h2>
        </div>
      </header>
      <div className="h-[1px] bg-ground-4" />
      <div className="m-3 mb-0">
        <Input
          placeholder={t('poi_searcher.placeholder')}
          addonAfter={
            <div className="px-2">
              <Select
                className="w-32"
                placeholder={t('common.all')}
                allowClear
                options={StatusList.map((e) => ({
                  value: e,
                  label: t(`schedule.status.${e}.title`),
                }))}
                onChange={(v) => {
                  if (v) {
                    searchParams.set('status', v)
                  } else {
                    searchParams.delete('status')
                  }
                  setSearchParams(searchParams, { replace: true })
                }}
              />
            </div>
          }
          onClear={() => handleSearch('')}
          onPressEnter={(evt) => handleSearch(evt.currentTarget.value)}
        />
      </div>
      <ScrollArea className="grow">
        {isLoading || !data ? (
          <AppSpin />
        ) : (
          <Spin spinning={isRefetching}>
            {data.length === 0 ? (
              <AppEmpty />
            ) : (
              <ul className="flex flex-col gap-3 p-3">
                {data.map((e) => (
                  <ScheduleListItem key={e.id} data={e} />
                ))}
              </ul>
            )}
          </Spin>
        )}
      </ScrollArea>
      <div className="flex justify-center py-3">
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('schedule.creation.title')}
        </Button>
      </div>
      <ScheduleModal
        title={t('schedule.creation.title')}
        open={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={handleAdd}
      />
    </div>
  )
})

ScheduleList.displayName = 'ScheduleList'

export default ScheduleList
