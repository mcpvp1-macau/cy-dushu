import { Button } from 'antd'
import ChildAction from './ChildAction'
import { endActionItem, startActionItem } from '@/service/modules/action-item'
import OverflowText from '@/components/ui/OverflowText'

type PropsType = {
  data: API_ACTION_ITEM.domain.ActionItem[]
  visibleSet: Set<number>
  waylineNameMap?: Record<string, string>
  onVisibleChange: (id: number, visible: boolean) => void
}

const ChildActionGroup: FC<PropsType> = ({
  data,
  visibleSet,
  waylineNameMap,
  onVisibleChange,
}) => {
  const { t } = useTranslation()
  const groupName = data[0]?.extra?.actionItemGroupName || '任务组'
  const groupTypeText =
    data[0]?.extra?.actionItemGroupType === 'cluster' ? '集群任务' : '任务组'

  const allowStart = useMemo(
    () => data.every((e) => e.status === 'PENDING'),
    [data],
  )

  const allowStop = useMemo(
    () => data.some((e) => e.status === 'PROCESSING'),
    [data],
  )

  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const handleStart = async () => {
    setLoading(true)
    try {
      await Promise.allSettled(data.map((e) => startActionItem(e.id)))
      await queryClient.invalidateQueries({
        queryKey: ['action', String(data[0].actionId), 'items'],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      await Promise.allSettled(
        data
          .filter((e) => e.status === 'PROCESSING')
          .map((e) => endActionItem(e.id)),
      )
      await queryClient.invalidateQueries({
        queryKey: ['action', String(data[0].actionId), 'items'],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <OverflowText className="text-hightlight text-sm font-medium truncate">
            {groupName}
          </OverflowText>
          <div className="mt-0.5 text-xs text-fore opacity-70">
            {groupTypeText} / 已拆分 {data.length} 个无人机任务
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="small"
            disabled={!allowStart}
            onClick={handleStart}
            loading={loading}
          >
            {t('action.item.startAll')}
          </Button>
          <Button
            size="small"
            disabled={!allowStop}
            onClick={handleStop}
            loading={loading}
          >
            {t('action.item.stopAll')}
          </Button>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {data.map((e, index) => (
          <li
            key={e.id}
            className={index > 0 ? 'border-t border-solid border-ground-5 pt-3' : ''}
          >
            <ChildAction
              data={e}
              noEdit
              visible={visibleSet.has(e.id)}
              waylineNameMap={waylineNameMap}
              onVisibleChange={(visible) => onVisibleChange(e.id, visible)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

ChildActionGroup.displayName = 'ChildActionGroup'

export default ChildActionGroup
