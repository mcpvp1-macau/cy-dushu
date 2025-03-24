import useWaylinesStore, { Wayline } from '@/store/map/useWaylines.store'
import { shouldJson } from '@/utils/json'
import { useUpdate } from 'ahooks'
import { uniqBy } from 'lodash'

/** 子任务 航线 显示/隐藏 */
const useVisibleCheck = (
  data: API_ACTION_ITEM.domain.ActionItem[] | undefined,
) => {
  // 由 data 和 visible 共同决定
  const visibleSet = useRef(new Set<number>())
  const visibleRecord = useRef(new Map<number, boolean>())

  const update = useUpdate()

  // 更新 store
  const handleUpdateStore = () => {
    if (!data) {
      return
    }

    const oldWaylines = useWaylinesStore.getState().waylines
    const oldWaylineMap = new Map<string, Wayline>(
      oldWaylines.map((e) => [e.id, e]),
    )

    let waylines: Wayline[] = []
    for (const task of data) {
      const info = shouldJson(task.taskTemplateInfo)
      if (!info || !task.taskTplId || !visibleSet.current.has(task.id)) {
        continue
      }
      const waylineType = info.waylineType ?? 'waypoint'
      const found = oldWaylineMap.get(task.taskTplId)
      if (found) {
        waylines.push(found)
      } else {
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
    }
    waylines = uniqBy(waylines, 'id')
    useWaylinesStore.getState().updateWaylines(waylines)
  }

  useEffect(() => {
    if (!data) {
      return
    }

    const r = visibleRecord.current

    const set = new Set(
      data
        .filter((e) => e.taskTemplateInfo && e.taskTplId)
        .filter((e) => (e.status !== 'FINISHED' && !r.has(e.id)) || r.get(e.id))
        .map((e) => e.id),
    )

    visibleSet.current = set
    handleUpdateStore()
    update()

    return () => {
      useWaylinesStore.getState().updateWaylines([])
    }
  }, [data])

  /**
   * 处理子任务可视变化
   * @param id 任务ID
   * @param visible 是否可见
   */
  const handleVisibleChange = (id: number, visible: boolean) => {
    if (visible) {
      visibleSet.current.add(id)
      visibleRecord.current.set(id, true)
    } else {
      visibleSet.current.delete(id)
      visibleRecord.current.set(id, false)
    }
    update()
    handleUpdateStore()
  }

  return { visibleSet: visibleSet.current, handleVisibleChange }
}

export default useVisibleCheck
