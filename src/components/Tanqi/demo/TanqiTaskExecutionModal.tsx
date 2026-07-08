import XModal from '@/components/XModal'
import { useAppMsg } from '@/hooks/useAppMsg'
import { TanqiTaskExecutionPreset } from './task-execution'

type PropsType = {
  open: boolean
  preset: TanqiTaskExecutionPreset
  onClose: () => void
}

const formatHeight = (value?: number | string) => {
  if (value == null || value === '') return '-'
  return typeof value === 'number' ? `${value}m` : value
}

/** RW 任务报告的演示执行确认弹窗。 */
const TanqiTaskExecutionModal: FC<PropsType> = memo(
  ({ open, preset, onClose }) => {
    const msgApi = useAppMsg()

    const fields = [
      ['行动名称', preset.actionName],
      ['行动编号', `RW-${preset.actionId}`],
      ['任务名称', preset.actionItemName],
      ['任务类型/目标', preset.taskTarget],
      ['任务区域/目标', preset.taskArea],
      ['执行装备', preset.deviceName],
      ['航线', preset.waylineName],
      ['飞行高度', formatHeight(preset.flightHeight)],
      ['返航高度', formatHeight(preset.returnHeight)],
      ['飞行速度', preset.speed],
      ['当前状态', preset.status],
      ['作战时序', preset.timing],
    ].filter(([, value]) => value)

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
        onClose={onClose}
        onConfirm={handleConfirm}
      >
        <div className="flex flex-col gap-3 pb-1 text-sm">
          <div className="rounded bg-ground-3 px-3 py-2">
            <div className="text-hightlight font-medium">{preset.reportTitle}</div>
            {preset.reportNo && (
              <div className="mt-1 text-xs text-fore opacity-60">
                报告编号: {preset.reportNo}
              </div>
            )}
          </div>

          <dl className="m-0 grid grid-cols-2 gap-2">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0 rounded bg-ground-3 px-2.5 py-2">
                <dt className="text-xs text-fore opacity-60">{label}</dt>
                <dd className="m-0 mt-1 text-hightlight text-sm truncate">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {preset.description && (
            <div className="rounded bg-ground-3 px-3 py-2 text-xs leading-5 text-fore">
              {preset.description}
            </div>
          )}
        </div>
      </XModal>
    )
  },
)

TanqiTaskExecutionModal.displayName = 'TanqiTaskExecutionModal'

export default TanqiTaskExecutionModal
