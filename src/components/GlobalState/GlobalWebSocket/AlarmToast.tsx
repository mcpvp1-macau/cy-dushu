import { WarningOutlined } from '@ant-design/icons'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import OverflowText from '@/components/ui/OverflowText'
import TextButton from '@/components/ui/button/TextButton'

type PropsType = {
  data: Record<string, any>
}

/** 告警通知 */
const AlarmToast: FC<PropsType> = memo(({ data }) => {
  const navigate = useNavigate()
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  const source = data.device_name || data.deviceName || data.sn || '未知设备'
  const sourceDeviceId = data.device_id || data.deviceId
  const time = data.time || data.update_time
  const level = data.alarm_level || data.alarmLevel
  const message = data.msg || '收到告警'

  const alarmLevelLabelMap = useMemo(
    () => ({
      Info: '普通',
      Warn: '警告',
      Error: '严重',
    }),
    [],
  )

  const alarmLevelLabel = level
    ? alarmLevelLabelMap[level as keyof typeof alarmLevelLabelMap] ?? level
    : undefined

  const handleDeviceClick = useMemoizedFn(() => {
    if (!sourceDeviceId) {
      return
    }
    updateRightMode(RightModeEnum.DEVICE)
    updateDetailId(sourceDeviceId)
    navigate('/')
  })

  return (
    <div className="flex rounded bg-ground-1/90 ring-1 ring-ground-5 w-[350px] backdrop-blur-sm items-start p-3 gap-3 z-10 shadow-lg">
      <div className="flex flex-1 items-center overflow-hidden">
        <div className="w-full overflow-hidden">
          <div className="flex gap-1 text-sm font-medium text-hightlight overflow-hidden items-center">
            <WarningOutlined className="text-red-500" />
            <OverflowText className="truncate">{message}</OverflowText>
          </div>
          <div className="mt-1 text-sm truncate" title={source}>
            来源: [
            <TextButton
              className="truncate align-middle"
              onClick={handleDeviceClick}
              disabled={!sourceDeviceId}
            >
              {source}
            </TextButton>
            ]
          </div>
          {(level || time) && (
            <div className="mt-1 text-xs text-ground-11 flex gap-3">
              {level && (
                <span className="shrink-0">{`等级: ${alarmLevelLabel}`}</span>
              )}
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
