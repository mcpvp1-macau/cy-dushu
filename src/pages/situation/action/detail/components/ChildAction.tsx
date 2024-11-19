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
import { memo, type FC } from 'react'

type PropsType = {
  data: API_ACTION_ITEM.domain.ActionItem
}

export const taskStatusMap: Record<string, string> = {
  PENDING: '未开始',
  PROCESSING: '进行中',
  FINISHED: '已完成',
  PAUSE: '暂停',
}

const statusColor: Record<string, string> = {
  PENDING: '#C7D1DC',
  PROCESSING: '#4C90F0',
  FINISHED: '#15B371',
  PAUSE: '#C7D1DC',
}

/** 操作栏 */
const OperatorBtns: FC<PropsType> = ({ data }) => {
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
      msgApi.success('操作成功')
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
              navigate(`/airline/edit/${data.taskTplId}${params}`)
            }}
          >
            编辑
          </Button>
          <Button size="small" onClick={() => handleClick('start')}>
            开始
          </Button>
        </div>
      )
    case 'PROCESSING':
      return (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleClick('pause')}>
            暂停
          </Button>
          <Button size="small" onClick={() => handleClick('end')}>
            结束
          </Button>
        </div>
      )
    case 'PAUSE':
      return (
        <div className="flex gap-2">
          <Button size="small" onClick={() => handleClick('continue')}>
            继续
          </Button>
          <Button size="small" onClick={() => handleClick('end')}>
            结束
          </Button>
        </div>
      )
  }
  return null
}

/** 子任务 */
const ChildAction: FC<PropsType> = memo(({ data }) => {
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
        'flex flex-col p-3 text-fore rounded-[3px] bg-ground-100',
        'border border-ground-250 border-solid',
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
        <span className="mr-1">执行人员:</span>
        <span>{pilotsStr || '-'}</span>
      </div>
      <div className="flex gap-2 overflow-hidden">
        <p className="grow flex overflow-hidden">
          <span className="mr-1 text-nowrap">执行设备:</span>
          <span className="max-w-32 truncate">{data.deviceName || '-'}</span>
        </p>
        <p className="shrink-0">
          <span className="mr-1 text-nowrap">任务状态:</span>
          <span style={{ color: statusColor[data.status!] }}>
            {taskStatusMap[data.status!]}
          </span>
        </p>
      </div>
    </li>
  )
})

ChildAction.displayName = 'ChildAction'

export default ChildAction
