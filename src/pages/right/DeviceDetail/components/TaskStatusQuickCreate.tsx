import IconPlus from '@/assets/icons/jsx/IconPlus'
import IconDetail from '@/assets/icons/jsx/IconDetail'
import OverflowText from '@/components/ui/OverflowText'
import IconButton from '@/components/ui/button/IconButton'
import FormModal from '@/components/XForm/Modal'
import { createAddActionFormItems } from '@/pages/situation/action/components/AddAction'
import AddSHJHTask from '@/pages/situation/action/detail/components/AddSHJHTask'
import AddTask from '@/pages/situation/action/detail/components/AddTask'
import { addAction, getAction } from '@/service/modules/action'
import { getDeviceLatestActionItem } from '@/service/modules/action-item'
import { useDictOptions } from '@/store/useDict.store'
import { DictEnum } from '@/enum/dict'
import globalConfig from '@/global/config'
import { Link, useParams } from 'react-router-dom'

interface TaskStatusQuickCreateProps {
  deviceId?: string
  className?: string
  nameMaxWidthClassName?: string
}

/**
 * 任务状态展示 + 快捷创建组件
 * - 路由存在 actionId：直接使用当前行动创建任务
 * - 无 actionId：先弹出行动表单创建行动，再创建任务；若有 deviceId 默认锁定该设备
 * - 支持航管版（useFlightReporting）和默认任务表单的差异化入参
 */
const TaskStatusQuickCreate: FC<TaskStatusQuickCreateProps> = memo(
  ({ deviceId, className, nameMaxWidthClassName = 'max-w-[220px]' }) => {
    const { t, i18n } = useTranslation()
    const { actionId: routeActionId } = useParams()
    const queryClient = useQueryClient()
    const [actionModalOpen, setActionModalOpen] = useState(false)
    const [actionConfirmLoading, setActionConfirmLoading] = useState(false)
    const [taskOpenKey, setTaskOpenKey] = useState<number>()
    const [createdAction, setCreatedAction] = useState<{
      actionId: string
      actionType?: string
    }>()

    const actionTypeOptions = useDictOptions(DictEnum.ACTION_TYPE)
    const actionFormItems = useMemo(
      () => createAddActionFormItems(t, actionTypeOptions),
      [t, i18n.language, actionTypeOptions],
    )

    const { data: actionDetail } = useQuery({
      queryKey: ['action', routeActionId],
      queryFn: () => getAction({ actionId: routeActionId }),
      select: (resp) => resp.data,
      enabled: !!routeActionId,
    })

    const { data: latestActionItem, isError: latestActionItemIsErr } = useQuery(
      {
        queryKey: ['action', 'item', 'device', 'latest', deviceId],
        queryFn: () =>
          getDeviceLatestActionItem(deviceId!).then((res) => res.data),
        enabled: !!deviceId,
        placeholderData: undefined,
        gcTime: 0,
      },
    )

    const taskActionId = routeActionId ?? createdAction?.actionId
    const taskActionType = createdAction?.actionType ?? actionDetail?.type ?? ''

    const handleCreateTask = () => {
      if (routeActionId) {
        setTaskOpenKey(Date.now())
        return
      }
      setActionModalOpen(true)
    }

    const handleTaskCreated = async () => {
      await queryClient.invalidateQueries({
        queryKey: ['action', 'item', 'device', 'latest', deviceId],
      })
    }

    const handleCreateAction = async (values: any) => {
      setActionConfirmLoading(true)
      try {
        const resp = await addAction(values)
        await queryClient.invalidateQueries({
          queryKey: ['actionList'],
          exact: false,
        })
        setCreatedAction({
          actionId: `${resp.data.actionId}`,
          actionType: values.type,
        })
        setActionModalOpen(false)
        setTaskOpenKey(Date.now())
      } finally {
        setActionConfirmLoading(false)
      }
    }

    return (
      <div className={clsx('flex flex-col gap-2', className)}>
        <div className="flex items-center gap-2 overflow-hidden">
          {latestActionItem && !latestActionItemIsErr ? (
            <div className="w-full flex gap-1 items-center overflow-hidden">
              <Link to={`/action/${latestActionItem.actionId}`}>
                <IconButton>
                  <IconDetail />
                </IconButton>
              </Link>
              <OverflowText
                className={clsx('flex-1 truncate', nameMaxWidthClassName)}
              >
                {latestActionItem.actionItemName || '-'}
              </OverflowText>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{t('common.noTask')}</span>
              <IconButton
                className="text-sm scale-95"
                onClick={handleCreateTask}
              >
                <IconPlus />
              </IconButton>
            </div>
          )}
        </div>

        {taskActionId && (
          <div className="hidden">
            {globalConfig.useFlightReporting ? (
              <AddSHJHTask
                actionId={taskActionId}
                actionType={taskActionType}
                openTriggerKey={taskOpenKey}
                onSuccess={handleTaskCreated}
                defaultDeviceId={deviceId}
              />
            ) : (
              <AddTask
                actionId={taskActionId}
                openTriggerKey={taskOpenKey}
                onSuccess={handleTaskCreated}
                defaultDeviceId={deviceId}
              />
            )}
          </div>
        )}

        <FormModal
          open={actionModalOpen}
          title={t('action.add.title')}
          items={actionFormItems}
          confirmLoading={actionConfirmLoading}
          onClose={() => setActionModalOpen(false)}
          onConfirm={handleCreateAction}
        />
      </div>
    )
  },
)

TaskStatusQuickCreate.displayName = 'TaskStatusQuickCreate'

export default TaskStatusQuickCreate
