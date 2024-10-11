import ScheduleListItem from './ScheduleItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import ScheduleModal from './ScheduleModal'
import { Button, Spin } from 'antd'
import { addActionPlan, getActionPlanList } from '@/service/modules/action-plan'
import AppSpin from '@/components/AppSpin'
import { useAppMsg } from '@/hooks/useAppMsg'
import AppEmpty from '@/components/AppEmpty'

type PropsType = unknown

const ScheduleList: FC<PropsType> = memo(() => {
  const queryClient = useQueryClient()
  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['getActionPlanList'],
      queryFn: () => getActionPlanList({}),
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
      msgApi.success('添加成功')
      queryClient.invalidateQueries({
        queryKey: ['getActionPlanList'],
      })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full min-w-[350px] w-[350px] border-r border-solid border-ground-250 flex flex-col">
      <h2 className="p-3 py-2 text-white">计划库</h2>
      <div className="h-[1px] bg-ground-250" />
      <ScrollArea className="grow">
        {isLoading || !data ? (
          <AppSpin />
        ) : (
          <Spin spinning={isRefetching}>
            {data.length === 0 ? (
              <AppEmpty />
            ) : (
              <ul>
                {data.map((e) => (
                  <ScheduleListItem key={e.id} data={e} />
                ))}
              </ul>
            )}
          </Spin>
        )}
      </ScrollArea>
      <div className="flex justify-center py-3">
        <Button type="primary" className="w-28" onClick={() => setOpen(true)}>
          创建计划
        </Button>
      </div>
      <ScheduleModal
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
