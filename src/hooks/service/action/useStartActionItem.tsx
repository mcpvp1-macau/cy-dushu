import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { endActionItem } from '@/service/modules/action-item'
import { isLiqunCommonError } from '@/service/servers/liqunAxios'

/**
 * 开始任务
 * @description 该 hook 用于处理设备的立即执行和开始, 可能存在有正在执行的任务, 用于停止。
 * @returns
 */
const useStartActionItem = () => {
  const [runningActionPayload, setRunningActionPayload] = useState<{
    actionItem: number
    message: string
  } | null>(null)

  const msgApi = useAppMsg()

  const { t } = useTranslation()
  const [confirmLoading, setConfirmLoading] = useState(false)

  async function startActionItem<T>(action: () => Promise<T>) {
    try {
      return await action()
    } catch (e) {
      if (isLiqunCommonError(e)) {
        // 该设备有正在执行的任务
        if (
          Array.isArray(e.data?.actionItemIdList) &&
          e.data.actionItemIdList.length
        ) {
          setRunningActionPayload({
            actionItem: e.data.actionItemIdList[0],
            message: e.message,
          })
        } else {
          msgApi.error(e.message)
        }
      }
      throw e
    }
  }

  // 停止任务
  const handleStopActionItem = async () => {
    if (runningActionPayload) {
      setConfirmLoading(true)
      try {
        await endActionItem(runningActionPayload.actionItem)
        msgApi.success(t('wayline.executeTask.success.stopTask.msg'))
        setRunningActionPayload(null)
      } finally {
        setConfirmLoading(false)
      }
    }
  }

  const stopModalHolder = runningActionPayload ? (
    <XModal
      title={t('common.executeError')}
      width={400}
      centered
      open={!!runningActionPayload}
      noPadding
      confirmLoading={confirmLoading}
      onClose={() => setRunningActionPayload(null)}
      onConfirm={handleStopActionItem}
    >
      <p className="m-3">{runningActionPayload.message}</p>
      <p className="m-3">{t('wayline.executeTask.question.stopTask.msg')}</p>
    </XModal>
  ) : null

  return {
    startActionItem,
    stopModalHolder,
  }
}

export default useStartActionItem
