import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { endActionItem } from '@/service/modules/action-item'
import { shouldJson } from '@/utils/json'

/**
 * 开始任务
 * @description 该 hook 用于处理设备的立即执行和开始, 可能存在有正在执行的任务, 用于停止。
 * @param needProcessAfterStop 是否要再次执行停止操作后继续执行该 action
 * @returns
 */
const useStartActionItem = (needProcessAfterStop = false) => {
  const [runningActionPayload, setRunningActionPayload] = useState<{
    actionItem: number
    message: string
  } | null>(null)
  const willAction = useRef<(() => Promise<any>) | null>(null)

  const msgApi = useAppMsg()

  const { t } = useTranslation()
  const [confirmLoading, setConfirmLoading] = useState(false)

  async function startActionItem<T>(action: () => Promise<T>) {
    try {
      return await action()
    } catch (e) {
      const err = shouldJson(e)
      console.log('err', err)
      if (
        Array.isArray(err.data?.actionItemIdList) &&
        err.data.actionItemIdList.length
      ) {
        setRunningActionPayload({
          actionItem: err.data.actionItemIdList[0],
          message: err.message,
        })
        if (needProcessAfterStop) {
          willAction.current = action
        }
      } else {
        msgApi.error(err.message)
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
        if (willAction.current) {
          await startActionItem(willAction.current)
          willAction.current = null
        }
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
