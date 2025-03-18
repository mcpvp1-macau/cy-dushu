import IconTask from '@/assets/icons/jsx/IconTask'
import { useAppMsg } from '@/hooks/useAppMsg'
import {
  endActionItem,
  pauseActionItem,
  startActionItem,
} from '@/service/modules/action-item'
import { shouldJson } from '@/utils/json'
import { LoadingOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { isNil } from 'lodash'

type PropsType = {
  data: API_ACTION_ITEM.domain.ActionItem
}

export const taskStatusMap: Record<string, Record<string, string>> = {
  en: {
    PENDING: 'Pending',
    PROCESSING: 'Tasking',
    FINISHED: 'Finished',
    PAUSE: 'Pausing',
  },
  zh: {
    PENDING: '未开始',
    PROCESSING: '进行中',
    FINISHED: '已完成',
    PAUSE: '暂停',
  },
}

const statusColor: Record<string, string> = {
  PENDING: '#C7D1DC',
  PROCESSING: '#4C90F0',
  FINISHED: '#15B371',
  PAUSE: '#C7D1DC',
}

/** 操作栏 */
const OperatorBtns: FC<PropsType> = ({ data }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleClick = async (action: string) => {
    setLoading(true)
    try {
      await {
        start: () => startActionItem(data.id),
        pause: () => pauseActionItem({ actionItemId: data.id, isPause: true }),
        continue: () =>
          pauseActionItem({ actionItemId: data.id, isPause: false }),
        end: () => endActionItem(data.id),
      }[action]()
      await queryClient.invalidateQueries({
        queryKey: ['action', String(data.actionId), 'items'],
      })
      msgApi.success(t('api.success.msg'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingOutlined />
  }
  switch (data.status) {
    case 'PENDING':
      return (
        <div className="flex gap-2">
          <Button
            size="small"
            disabled={isNil(data.taskTplId)}
            onClick={() => {
              const info = shouldJson(data.taskTemplateInfo)
              let params = `?actionId=${data.actionId}&actionItemId=${
                data.id
              }&name=${data.actionItemName ?? ''}`
              if (info) {
                if (!isNil(info.parameters)) {
                  params += `&parameters=${JSON.stringify(info.parameters)}`
                }
                if (!isNil(info.taskBasic)) {
                  params += `&taskBasic=${info.taskBasic}`
                }
                if (!isNil(info.camera)) {
                  params += `&camera=${JSON.stringify(info.camera)}`
                }
              }
              const t = shouldJson(info.taskBasic).waylineType
              navigate(
                `/wayline/${
                  t === 'area_waypoint' ? 'area-wayline-edit' : 'edit'
                }/${data.taskTplId}${params}`,
              )
            }}
          >
            {t('action.detail.task.edit.title')}
          </Button>
          <Button size="small" onClick={() => handleClick('start')}>
            {t('action.detail.task.start.title')}
          </Button>
        </div>
      )
    case 'PROCESSING':
      return (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleClick('pause')}>
            {t('action.detail.task.pause.title')}
          </Button>
          <Button size="small" onClick={() => handleClick('end')}>
            {t('action.detail.task.end.title')}
          </Button>
        </div>
      )
    case 'PAUSE':
      return (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleClick('continue')}>
            {t('action.detail.task.continue.title')}
          </Button>
          <Button size="small" onClick={() => handleClick('end')}>
            {t('action.detail.task.end.title')}
          </Button>
        </div>
      )
  }
  return null
}

/** 子任务 */
const ChildAction: FC<PropsType> = memo(({ data }) => {
  const { t, i18n } = useTranslation()
  // 任务执行人员
  let pilotsStr = ''
  if (data.extra) {
    const pilots = JSON.parse(data.extra) || []
    if (Array.isArray(pilots)) {
      pilotsStr = pilots.map((p) => p.name).join(', ')
    }
  }

  return (
    <li
      className={clsx(
        'flex flex-col p-3 text-fore rounded-[3px] bg-ground-1',
        'border border-ground-4 border-solid',
      )}
    >
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex gap-2">
          <IconTask />
          <span className="text-white">{data.actionItemName || '-'}</span>
        </div>
        <div>
          <OperatorBtns data={data} />
        </div>
      </div>
      <div>
        <span className="mr-1">{t('action.detail.task.people.title')}:</span>
        <span>{pilotsStr || '-'}</span>
      </div>
      <div className="flex gap-2 overflow-hidden">
        <p className="grow flex overflow-hidden">
          <span className="mr-1 text-nowrap">
            {t('action.detail.task.device.title')}:
          </span>
          <span className="max-w-32 truncate">{data.deviceName || '-'}</span>
        </p>
        <p className="shrink-0">
          <span className="mr-1 text-nowrap">
            {t('action.detail.task.status.title')}:
          </span>
          <span style={{ color: statusColor[data.status!] }}>
            {taskStatusMap[i18n.language][data.status!]}
          </span>
        </p>
      </div>
    </li>
  )
})

ChildAction.displayName = 'ChildAction'

export default ChildAction
