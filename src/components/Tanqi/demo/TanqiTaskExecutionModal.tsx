import IconDetail from '@/assets/icons/jsx/IconDetail'
import XModal from '@/components/XModal'
import IconButton from '@/components/ui/button/IconButton'
import { RightModeEnum } from '@/enum/right-mode'
import { useAppMsg } from '@/hooks/useAppMsg'
import useRightMode from '@/store/layout/useRightMode.store'
import { TanqiTaskExecutionPreset } from './task-execution'
import {
  dispatchFullFlowReportTask,
  isFullFlowDemoMode,
  isSeatDemoMode,
} from '@/demo/situation/full-flow-demo.store'
import { dispatchSeatDemoReportTask } from '@/demo/situation/seat-demo.store'

type PropsType = {
  open: boolean
  preset: TanqiTaskExecutionPreset
  onClose: () => void
}

/** RW 任务报告的演示执行确认弹窗。 */
const TanqiTaskExecutionModal: FC<PropsType> = memo(
  ({ open, preset, onClose }) => {
    const msgApi = useAppMsg()
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const waylineText = preset.waylineName
    const childTasks = preset.childTasks ?? []
    const showGroupedCard = preset.isGrouped && childTasks.length > 1

    const handleConfirm = () => {
      if (isFullFlowDemoMode()) {
        dispatchFullFlowReportTask(preset.actionId, preset.waylineTemplateId)
      } else if (isSeatDemoMode()) {
        dispatchSeatDemoReportTask(preset.actionId, preset.waylineTemplateId)
      }
      if (isFullFlowDemoMode() || isSeatDemoMode()) {
        queryClient.invalidateQueries({
          queryKey: ['action', preset.actionId, 'items'],
        })
        queryClient.invalidateQueries({ queryKey: ['airlineTemplate'] })
        queryClient.invalidateQueries({ queryKey: ['waylineTemplates'] })
      }
      msgApi.success('任务已下发执行')
      onClose()
    }

    const handleDetailClick = (deviceId?: string) => {
      if (!deviceId) return
      useRightMode.getState().updateRightMode(RightModeEnum.DEVICE)
      useRightMode.getState().updateDetailId(deviceId)
    }

    return (
      <XModal
        title="行动执行确认"
        open={open}
        width={showGroupedCard ? 520 : 440}
        centered
        confirmTitle="立即执行"
        cancelText="取消"
        footerClassName="text-center"
        onClose={onClose}
        onConfirm={handleConfirm}
      >
        <div className="pb-1 text-sm">
          <div className="tanqi-action-card rounded border border-solid border-ground-3 bg-ground-2 px-3 py-2">
            <div className="min-w-0">
              <div className="text-hightlight font-medium truncate">
                {preset.actionItemName || preset.reportTitle}
              </div>
              {showGroupedCard ? (
                <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
                  {childTasks.map((task, index) => (
                    <li
                      key={task.actionItemId}
                      className={
                        index > 0
                          ? 'border-t border-solid border-ground-5 pt-2'
                          : ''
                      }
                    >
                      <div className="truncate text-xs font-medium text-hightlight">
                        {task.actionItemName}
                      </div>
                      <div className="mt-1 flex flex-col gap-1 text-xs text-fore">
                        <div className="min-w-0 truncate">
                          状态:{' '}
                          <span className="text-primary">{task.status}</span>
                        </div>
                        <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                          <span className="shrink-0">设备:</span>
                          {task.deviceId && (
                            <IconButton
                              tippyProps={{ content: t('common.detail') }}
                              onClick={() => handleDetailClick(task.deviceId)}
                            >
                              <IconDetail />
                            </IconButton>
                          )}
                          <span className="min-w-0 flex-1 truncate">
                            {task.deviceName || '-'}
                          </span>
                        </div>
                        {task.waylineName && (
                          <div className="min-w-0 truncate">
                            航线: <span>{task.waylineName}</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-1 flex flex-col gap-1 text-xs text-fore">
                  <div className="min-w-0 truncate">
                    状态: <span className="text-primary">{preset.status}</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                    <span className="shrink-0">设备:</span>
                    {preset.deviceId && (
                      <IconButton
                        tippyProps={{ content: t('common.detail') }}
                        onClick={() => handleDetailClick(preset.deviceId)}
                      >
                        <IconDetail />
                      </IconButton>
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {preset.deviceName || '-'}
                    </span>
                  </div>
                  {waylineText && (
                    <div className="min-w-0 truncate">
                      航线: <span>{waylineText}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </XModal>
    )
  },
)

TanqiTaskExecutionModal.displayName = 'TanqiTaskExecutionModal'

export default TanqiTaskExecutionModal
