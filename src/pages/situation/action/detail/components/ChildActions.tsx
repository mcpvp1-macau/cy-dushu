import AppEmpty from '@/components/AppEmpty'
import AppSpin from '@/components/AppSpin'
import { getActionItemList } from '@/service/modules/action-item'
import ChildAction from './ChildAction'
import { Spin } from 'antd'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { shouldJson } from '@/utils/json'
import useWaylinesStore, { Wayline } from '@/store/map/useWaylines.store'
import { uniqBy } from 'lodash'
import { useUpdate } from 'ahooks'

type PropsType = {
  actionId: string
  isBacktracking?: boolean
}

/** 子任务列表 */
const ChildActions: FC<PropsType> = memo(({ actionId, isBacktracking }) => {
  const queryClient = useQueryClient()

  const useStore = isBacktracking ? useBackTrackingStore : null

  // 由 data 和 visible 共同决定
  const visibleSet = useRef(new Set<number>())
  console.log(visibleSet)
  const visibleRecord = useRef(new Map<number, boolean>())

  const updateChildActions = useStore?.((s) => s.updateChildActions)
  const { data, isLoading, isRefetching } = useQuery(
    {
      queryKey: ['action', actionId, 'items'],
      queryFn: async () => {
        const d = await getActionItemList({ actionId })

        if (!Array.isArray(d.data.rows)) {
          return []
        }

        const r = visibleRecord.current

        updateChildActions?.(d.data.rows)

        const set = new Set(
          d.data.rows
            .filter((e) => e.taskTemplateInfo && e.taskTplId)
            .filter(
              (e) => (e.status !== 'FINISHED' && !r.has(e.id)) || r.get(e.id),
            )
            .map((e) => e.id),
        )

        visibleSet.current = set
        handleUpdateStore()

        return d.data.rows
      },
    },
    queryClient,
  )

  const handleUpdateStore = () => {
    if (!data) {
      return
    }
    let waylines: Wayline[] = []
    for (const task of data) {
      const info = shouldJson(task.taskTemplateInfo)
      if (!info || !task.taskTplId || !visibleSet.current.has(task.id)) {
        continue
      }
      const waylineType = info.waylineType ?? 'waypoint'
      waylines.push({
        id: task.taskTplId,
        type: waylineType,
        points: (info.parameters?.spaces?.[0]?.positions ?? []).map((e) => ({
          pointX: e.pointX,
          pointY: e.pointY,
          pointZ: e.pointZ,
        })),
      })
    }
    waylines = uniqBy(waylines, 'id')
    useWaylinesStore.getState().updateWaylines(waylines)
  }

  const update = useUpdate()

  return (
    <>
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
                  <ChildAction
                    key={item.id}
                    data={item}
                    visible={visibleSet.current.has(item.id)}
                    onVisibleChange={(visible) => {
                      if (visible) {
                        visibleSet.current.add(item.id)
                        visibleRecord.current.set(item.id, true)
                      } else {
                        visibleSet.current.delete(item.id)
                        visibleRecord.current.set(item.id, false)
                      }
                      update()
                      handleUpdateStore()
                    }}
                  />
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
