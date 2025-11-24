import IconPause from '@/assets/icons/jsx/IconPause'
import IconPlay from '@/assets/icons/jsx/IconPlay'
import IconStopCircle from '@/assets/icons/jsx/IconStopCircle'
import IconButton from '@/components/ui/button/IconButton'
import { useAppMsg } from '@/hooks/useAppMsg'
import { taskStatusMap } from '@/pages/situation/action/detail/components/ChildActions/ChildAction'
import { endActionItem, pauseActionItem } from '@/service/modules/action-item'
import useDeviceLatestTaskStore from '@/store/useDeviceLatestTask.store'
import useGlobalWsStore from '@/store/useGlobalWebSocket.store'
import { LoadingOutlined } from '@ant-design/icons'

type PropsType = {
  deviceId: string
}

/** 最新任务 */
const LatestTask: FC<PropsType> = memo(({ deviceId }) => {
  const msgApi = useAppMsg()
  const actionItem = useGlobalWsStore((s) => s.actionItemStatus[deviceId])

  const { t, i18n } = useTranslation()

  const queryClient = useQueryClient()

  const taskData = useDeviceLatestTaskStore((s) => s.latestTask[deviceId])

  const status = taskData?.status

  const [operLoading, setOperLoading] = useState(false)

  const taskId = actionItem?.actionItemId
  const handleClick = async (action: string) => {
    setOperLoading(true)
    try {
      await {
        // start: () => startActionItem(taskId),
        pause: () => pauseActionItem({ actionItemId: taskId, isPause: true }),
        continue: () =>
          pauseActionItem({ actionItemId: taskId, isPause: false }),
        end: () => endActionItem(taskId),
      }[action]()
      await queryClient.invalidateQueries({
        queryKey: ['getLatestTask', deviceId],
      })
      msgApi.success('操作成功')
    } finally {
      setOperLoading(false)
    }
  }

  return (
    <div className="flex gap-2 items-center whitespace-nowrap">
      <div className="flex gap-2 w-9">
        {operLoading ? (
          <LoadingOutlined />
        ) : status === 'RUNNING' ? (
          <>
            <IconButton
              tippyProps={{
                content: t('action.detail.task.pause.title'),
              }}
              onClick={() => handleClick('pause')}
            >
              <IconPause className="scale-75" />
            </IconButton>
            <IconButton
              tippyProps={{
                content: t('action.detail.task.end.title'),
              }}
              onClick={() => handleClick('end')}
            >
              <IconStopCircle className="scale-90" />
            </IconButton>
          </>
        ) : status === 'HANGUP' ? (
          <>
            <IconButton
              tippyProps={{
                content: t('action.detail.task.continue.title'),
              }}
              onClick={() => handleClick('continue')}
            >
              <IconPlay className="scale-75" />
            </IconButton>
            <IconButton
              tippyProps={{
                content: t('action.detail.task.end.title'),
              }}
              onClick={() => handleClick('end')}
            >
              <IconStopCircle className="scale-90" />
            </IconButton>
          </>
        ) : null}
      </div>
      <label>
        {status === 'RUNNING'
          ? t('action.detail.task.status.RUNNING.title')
          : status === 'HANGUP'
          ? t('action.detail.task.status.HANGUP.title')
          : taskStatusMap[i18n.language][status]}
      </label>
    </div>
  )
})

LatestTask.displayName = 'LatestTask'

export default LatestTask
