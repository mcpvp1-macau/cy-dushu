import IconBattery from '@/assets/icons/jsx/IconBattery'
import IconNotReported from '@/assets/icons/jsx/IconNotReported'
import IconReported from '@/assets/icons/jsx/IconReported'
import IconTaskIdle from '@/assets/icons/jsx/IconTaskIdle'
import IconTaskRunning from '@/assets/icons/jsx/IconTaskRunning'
import IconVisible from '@/assets/icons/jsx/IconVisible'
import DeviceIcon from '@/components/device/DeviceIcon'
import IconButton from '@/components/ui/button/IconButton'
import TagItem from '@/components/TagItem'
import { RightModeEnum } from '@/enum/right-mode'
import useRightMode from '@/store/layout/useRightMode.store'
import { Badge, Tooltip } from 'antd'
import useDeviceListConfigStore from '@/store/useDeviceListConfig.store'
import IconNotVisible from '@/assets/icons/jsx/IconNotVisible'

type PropsType = {
  data: API_DEVICE.domain.Device
}

/** 任务状态 */
const TaskStatusTag: FC<{ taskStatus: string }> = ({ taskStatus }) => {
  const label = taskStatus === 'RUNNING' ? '任务中' : '无任务'
  const color =
    taskStatus === 'RUNNING' ? 'rgb(21, 179, 113)' : 'rgb(199, 209, 220)'
  const bgColor =
    taskStatus === 'RUNNING'
      ? 'rgba(21, 179, 113, 0.15)'
      : 'rgba(199, 209, 220, 0.1)'
  const icon =
    taskStatus === 'RUNNING' ? (
      <IconTaskRunning className="text-[10px]" />
    ) : (
      <IconTaskIdle className="text-[10px]" />
    )
  return <TagItem label={label} color={color} bgColor={bgColor} icon={icon} />
}

/** 电量状态 */
const BatteryStatusTag: FC<{ battery: number }> = ({ battery }) => {
  return (
    <TagItem
      label={`${battery}%`}
      icon={<IconBattery className="text-[10px]" />}
      color="rgb(199, 209, 220)"
      bgColor="rgba(199, 209, 220, 0.1)"
      width="60px"
    />
  )
}

/** 设备树中的设备项 */
const DeviceItem: FC<PropsType> = memo(({ data }) => {
  const updateRightMode = useRightMode((s) => s.updateRightMode)
  const updateDetailId = useRightMode((s) => s.updateDetailId)

  const handleClick = useMemoizedFn(() => {
    updateRightMode(RightModeEnum.DEVICE)
    updateDetailId(data.deviceId)
  })

  /** 设备型号 */
  const moduleNumber = useMemo(
    () => data.deviceTags.find((e) => e.tagName === 'MODEL_NUMBER')?.tagValue,
    [data],
  )

  const isHidden = useDeviceListConfigStore(
    (s) => s.hiddenDeviceIds[data.deviceId],
  )
  const updateHiddenDeviceIds = useDeviceListConfigStore(
    (s) => s.updateHiddenDeviceIds,
  )

  return (
    <div onClick={handleClick}>
      <div className="w-[350px] px-3 py-1 flex items-center justify-between text-fore">
        <div className="flex items-center gap-2">
          <div className="text-white">
            <Badge
              dot
              offset={[0, 20]}
              color={data.status === 'ONLINE' ? 'rgb(21, 179, 113)' : '#E45951'}
            >
              <DeviceIcon type={data.deviceType} />
            </Badge>
          </div>
          <span>{data.deviceName}</span>
        </div>
        <div className="pr-6">
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              const newHiddenDeviceIds = {
                ...useDeviceListConfigStore.getState().hiddenDeviceIds,
              }
              newHiddenDeviceIds[data.deviceId] = !isHidden
              updateHiddenDeviceIds(newHiddenDeviceIds)
            }}
          >
            {isHidden ? <IconNotVisible /> : <IconVisible />}
          </IconButton>
        </div>
      </div>
      <div className="px-6 mb-2 flex items-center gap-2">
        <TaskStatusTag taskStatus={data.taskStatus} />
        <BatteryStatusTag battery={data.remainingPower || 0} />
        {/* 判断是否报备 */}
        {'REPORTED' ===
        data.deviceTags?.find(
          (tag) => 'FLIGHT_REPORTING_STATUS' === tag.tagName,
        )?.tagValue ? (
          <Tooltip title="已报备">
            <IconReported className="text-xs ml-2 text-[#15B371]" />
          </Tooltip>
        ) : (
          <Tooltip title="未报备">
            <IconNotReported className="text-xs ml-2 text-fore" />
          </Tooltip>
        )}
        <span>{moduleNumber}</span>
      </div>
    </div>
  )
})

DeviceItem.displayName = 'DeviceItem'

export default DeviceItem
