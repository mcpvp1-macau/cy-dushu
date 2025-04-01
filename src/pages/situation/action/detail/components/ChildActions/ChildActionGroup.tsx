import { Button } from 'antd'
import ChildAction from './ChildAction'
import IconSwarm from '@/assets/icons/jsx/IconSwarm'
import { startActionItem } from '@/service/modules/action-item'
import { Link } from 'react-router-dom'
import { getWaylineEditURL } from '@/pages/wayline/components/AirlineTemplateListItem'
import { WaylineEnum } from '@/constant/uav/wayline'
import { Fragment } from 'react/jsx-runtime'

type PropsType = {
  data: API_ACTION_ITEM.domain.ActionItem[]
  visibleSet: Set<number>
  onVisibleChange: (id: number, visible: boolean) => void
}

const ChildActionGroup: FC<PropsType> = ({
  data,
  visibleSet,
  onVisibleChange,
}) => {
  const allowStart = useMemo(
    () => data.every((e) => e.status === 'PENDING'),
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

  const waylineTemplateId = data[0].extra.waylineTemplateId

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Button
          size="small"
          disabled={!allowStart}
          onClick={handleStart}
          loading={loading}
        >
          全都开始
        </Button>
        {waylineTemplateId && (
          <Link
            to={`${getWaylineEditURL(
              WaylineEnum.SwarmWayline,
            )}/${waylineTemplateId}`}
          >
            <Button size="small" icon={<IconSwarm />}>
              编辑
            </Button>
          </Link>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {data.map((e) => (
          <Fragment key={e.id}>
            <div className="h-[1px] bg-ground-5" />
            <li>
              <ChildAction
                data={e}
                noEdit
                visible={visibleSet.has(e.id)}
                onVisibleChange={(visible) => onVisibleChange(e.id, visible)}
              />
            </li>
          </Fragment>
        ))}
      </ul>
    </div>
  )
}

ChildActionGroup.displayName = 'ChildActionGroup'

export default ChildActionGroup
