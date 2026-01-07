import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { getActionItemList } from '@/service/modules/action-item'
import ChildAction from './ChildAction'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import useVisibleCheck from './useVisibleCheck'
import { shouldJson } from '@/utils/json'
import ChildActionGroup from './ChildActionGroup'
import { getAirlineTemplateList } from '@/service/modules/airline'
import {
  useGetDensityStatistics,
  useListenRealDensityMap,
} from '@/store/map/useDensityMap.store'
import { Spin } from 'antd'
import ChildActionQuickPin from './ChildActionQuickPin'

type PropsType = {
  actionId: number
  isBacktracking?: boolean
  actionType?: string
}

/** 子任务列表 */
const ChildActions: FC<PropsType> = memo(
  ({ actionId, isBacktracking, actionType }) => {
  const queryClient = useQueryClient()

  const useStore = isBacktracking ? useBackTrackingStore : null

  const updateChildActions = useStore?.((s) => s.updateChildActions)
  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['action', actionId, 'items'],
      queryFn: async () => {
        const d = await getActionItemList({ actionId: String(actionId) })
        if (!Array.isArray(d.data.rows)) {
          return []
        }
        d.data.rows = d.data.rows.map((item) => ({
          ...item,
          taskTemplateInfo: shouldJson(item.taskTemplateInfo),
          extra: shouldJson(item.extra),
        }))
        updateChildActions?.(d.data.rows)
        return d.data.rows
      },
    },
    queryClient,
  )

  const { visibleSet, handleVisibleChange } = useVisibleCheck(data)

  type item = API_ACTION_ITEM.domain.ActionItem

  const data2 = useMemo(() => {
    if (!data) {
      return []
    }

    const res: (
      | {
          id: string
          data: item[]
        }
      | item
    )[] = []
    const indexMap = new Map<string, item[]>()

    for (const e of data) {
      const groupdId: string | undefined = e.extra?.actionItemGroupId
      if (groupdId) {
        if (indexMap.has(groupdId)) {
          indexMap.get(groupdId)!.push(e)
        } else {
          const group: item[] = []
          group.push(e)
          indexMap.set(groupdId, group)
          res.push({
            id: groupdId,
            data: group,
          })
        }
      } else {
        res.push(e)
      }
    }
    return res
  }, [data])

  const { data: airlineTemplateList } = useQuery(
    {
      queryKey: ['airlineTemplate'],
      queryFn: () => getAirlineTemplateList({ isPage: false }),
      select: (d) => d?.data.rows ?? [],
    },
    queryClient,
  )

  const waylineNameMap = useMemo(() => {
    return Object.fromEntries(
      airlineTemplateList?.map((e) => [e.templateId, e.taskName]) ?? [],
    )
  }, [airlineTemplateList])

  const runningDeviceIds = useMemo(() => {
    if (!data?.length) {
      return new Set<string>()
    }
    const set = new Set<string>()
    data.forEach((item) => {
      if (item.status === 'PROCESSING' && item.deviceId) {
        item.deviceId.split(',').forEach((deviceId) => {
          if (deviceId) {
            set.add(deviceId)
          }
        })
      }
    })
    return set
  }, [data])

  useGetDensityStatistics({ actionId })
  useListenRealDensityMap((deviceId) => runningDeviceIds.has(deviceId))

  // 业务规则：只有行动类型为 ltfk 才展示一键钉出入口
  const showQuickPin = actionType === 'ltfk'

  return (
    <>
      <div>
        {isLoading || !data ? (
          <AppSpin />
        ) : data.length === 0 ? (
          <AppEmpty />
        ) : (
          <ScrollArea className="max-h-[45vh]">
            <Spin spinning={isRefetching}>
              {showQuickPin && (
                <div className="flex justify-end px-3 pt-3">
                  <ChildActionQuickPin actionItems={data} />
                </div>
              )}
              <ul className="flex flex-col gap-3 p-3 pt-2">
                {data2.map((item) => (
                  <li
                    key={String(item.id)}
                    className={clsx(
                      'flex flex-col p-3 text-fore rounded-[3px] bg-ground-1 max-w-[325px]',
                      'border border-ground-4 border-solid',
                    )}
                  >
                    {Array.isArray(item.data) ? (
                      <ChildActionGroup
                        data={item.data}
                        visibleSet={visibleSet}
                        onVisibleChange={(id, visible) =>
                          handleVisibleChange(id, visible)
                        }
                      />
                    ) : (
                      <ChildAction
                        data={item as item}
                        visible={visibleSet.has((item as item).id)}
                        onVisibleChange={(visible) =>
                          handleVisibleChange((item as item).id, visible)
                        }
                        waylineNameMap={waylineNameMap}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </Spin>
          </ScrollArea>
        )}
      </div>
    </>
  )
})

ChildActions.displayName = 'ChildActions'

export default ChildActions
