import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { updateDialog } from '@/service/modules/tanqi'
import { Button } from 'antd'

type PropsType = {
  isCommandControl: boolean
  chatId?: number
  onStartNewDialog: (openTaskUnderstanding: 0 | 1 | 2) => void
}

/** 指令控制 */
const CommandControl: FC<PropsType> = memo(
  ({ isCommandControl, chatId, onStartNewDialog }) => {
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
      if (!chatId) {
        onStartNewDialog(2)
      } else {
        updateDialogAsync({
          id: chatId,
          taskUnderstanding: isCommandControl ? 0 : 2,
        })
      }
    }

    return (
      <Button
        size="small"
        type={isCommandControl ? 'primary' : 'default'}
        shape="round"
        loading={isPending}
        onClick={handleClick}
      >
        {t('tanqi.commandControl.title')}
      </Button>
    )
  },
)

CommandControl.displayName = 'TaskUnderstanding'

export default CommandControl
