import { WarningOutlined } from '@ant-design/icons'
import OverflowText from '@/components/ui/OverflowText'

type PropsType = {
  data: Record<string, any>
}

/** 告警通知 */
const AlarmToast: FC<PropsType> = memo(({ data }) => {
  const source = data.device_name || data.deviceName || data.sn || '未知设备'
  const time = data.time || data.update_time
  const level = data.alarm_level || data.alarmLevel
  const message = data.msg || '收到告警'

  return (
    <div className="flex rounded bg-ground-1/90 ring-1 ring-ground-5 w-[350px] backdrop-blur-sm items-start p-3 gap-3 z-10 shadow-lg">
      <div className="flex flex-1 items-center overflow-hidden">
        <div className="w-full overflow-hidden">
          <div className="flex gap-1 text-sm font-medium text-hightlight overflow-hidden items-center">
            <WarningOutlined className="text-red-500" />
            <OverflowText className="truncate">{message}</OverflowText>
          </div>
          <div className="mt-1 text-sm truncate" title={source}>
            {`来源: [${source}]`}
          </div>
          {(level || time) && (
            <div className="mt-1 text-xs text-ground-11 flex gap-3">
              {level && <span className="shrink-0">{`等级: ${level}`}</span>}
              {time && (
                <span className="truncate" title={time}>
                  {`时间: ${time}`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

AlarmToast.displayName = 'AlarmToast'

export default AlarmToast
