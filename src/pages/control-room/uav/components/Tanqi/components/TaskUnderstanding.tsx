import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { updateDialog } from '@/service/modules/tanqi'
import { Button } from 'antd'

type PropsType = {
  isTaskUnderstanding: boolean
  chatId: number
}

const TaskUnderstanding: FC<PropsType> = memo(
  ({ isTaskUnderstanding, chatId }) => {
    const { t } = useTranslation()
    const deviceId = useDeviceDetailStore((s) => s.deviceId)

    const queryClient = useQueryClient()
    const { mutateAsync: updateDialogAsync, isPending } = useMutation({
      mutationFn: updateDialog,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['chats', deviceId],
        })
      },
    })

    const handleClick = async () => {
      updateDialogAsync({
        id: chatId,
        taskUnderstanding: isTaskUnderstanding ? 0 : 1,
      })
    }

    return (
      <Button
        size="small"
        type={isTaskUnderstanding ? 'primary' : 'default'}
        shape="round"
        loading={isPending}
        onClick={handleClick}
      >
        {t('tanqi.taskUnderstanding.title')}
      </Button>
    )
  },
)

TaskUnderstanding.displayName = 'TaskUnderstanding'

export default TaskUnderstanding
