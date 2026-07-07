import {
  FIXED_WING_TASK_CAPABILITIES,
  getDefaultTaskCapability,
} from '@/demo/fixed-wing/constants'
import useFixedWingDemoStore from '@/demo/fixed-wing/useFixedWingDemo.store'
import { Select } from 'antd'

type PropsType = {
  deviceId: string
}

/** 可执行任务类型列（纯前端演示, 本地持久化） */
const TaskCapabilityColumn: FC<PropsType> = memo(({ deviceId }) => {
  const value = useFixedWingDemoStore(
    (s) => s.taskCapabilities[deviceId] ?? getDefaultTaskCapability(deviceId),
  )

  return (
    <Select
      size="small"
      className="w-28"
      value={value}
      options={FIXED_WING_TASK_CAPABILITIES.map((e) => ({
        label: e,
        value: e,
      }))}
      onChange={(v) =>
        useFixedWingDemoStore.getState().updateDeviceTaskCapability(deviceId, v)
      }
    />
  )
})

TaskCapabilityColumn.displayName = 'TaskCapabilityColumn'

export default TaskCapabilityColumn
