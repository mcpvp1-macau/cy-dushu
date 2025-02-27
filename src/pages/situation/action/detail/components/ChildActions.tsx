import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { getActionItemList } from '@/service/modules/action-item'
import ChildAction from './ChildAction'
import { Spin } from 'antd'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'

type PropsType = {
  actionId: string
}

/** 子任务列表 */
const ChildActions: FC<PropsType> = memo(({ actionId }) => {
  const queryClient = useQueryClient()

  const updateChildActions = useBackTrackingStore((s) => s.updateChildActions)
  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['action', actionId, 'items'],
      queryFn: () => getActionItemList({ actionId }),
      select: (d) => {
        updateChildActions(d.data.rows)
        return d.data.rows
      },
    },
    queryClient,
  )

  return (
    <div>
      {isLoading || !data ? (
        <AppSpin />
      ) : data.length === 0 ? (
        <AppEmpty />
      ) : (
        <ScrollArea className="max-h-[330px]">
          <Spin spinning={isRefetching}>
            <ul className="flex flex-col gap-3 p-3">
              {data.map((item) => (
                <ChildAction key={item.id} data={item} />
              ))}
            </ul>
          </Spin>
        </ScrollArea>
      )}
    </div>
  )
})

ChildActions.displayName = 'ChildActions'

export default ChildActions
