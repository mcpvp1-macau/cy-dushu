import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { EyeOutlined } from '@ant-design/icons'
import { TanqiTaskExecutionPreset } from './task-execution'

type PropsType = {
  open: boolean
  preset: TanqiTaskExecutionPreset
  onClose: () => void
}

/** RW 任务报告的演示执行确认弹窗。 */
const TanqiTaskExecutionModal: FC<PropsType> = memo(
  ({ open, preset, onClose }) => {
    const msgApi = useAppMsg()
    const waylineText = [preset.waylineName, preset.waylineSummary]
      .filter(Boolean)
      .join(' / ')

    const handleConfirm = () => {
      msgApi.success('任务已下发执行')
      onClose()
    }

    return (
      <XModal
        title="行动执行确认"
        open={open}
        width={440}
        centered
        confirmTitle="立即执行"
        cancelText="取消"
        footerClassName="text-center"
        onClose={onClose}
        onConfirm={handleConfirm}
      >
        <div className="pb-1 text-sm">
          <div className="tanqi-action-card rounded border border-solid border-ground-3 bg-ground-2 px-3 py-2">
            <div className="flex items-start gap-2">
              <EyeOutlined className="mt-0.5 shrink-0 text-fore opacity-80" />
              <div className="min-w-0 flex-1">
                <div className="text-hightlight font-medium truncate">
                  {preset.actionItemName || preset.reportTitle}
                </div>
                <div className="mt-1 flex flex-col gap-1 text-xs text-fore">
                  <div className="min-w-0 truncate">
                    状态: <span className="text-primary">{preset.status}</span>
                  </div>
                  <div className="min-w-0 truncate">
                    设备: <span>{preset.deviceName || '-'}</span>
                  </div>
                  {waylineText && (
                    <div className="min-w-0 truncate">
                      航线: <span>{waylineText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </XModal>
    )
  },
)

TanqiTaskExecutionModal.displayName = 'TanqiTaskExecutionModal'

export default TanqiTaskExecutionModal
