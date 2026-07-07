import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  /** 飞机编号（资源页可录入） */
  deviceNo: string
  /** 飞机类型（资源页可录入） */
  deviceTypeName: string
  /** 可执行任务（资源页可录入） */
  taskCapability: string
  /** 各设备可执行任务类型 (deviceId -> 任务类型) */
  taskCapabilities: Record<string, string>
  /** 传感器模式 电视/红外 */
  sensorMode: 'tv' | 'ir'
  /** 工作模式 */
  workMode: string
  /** 激光是否上电 */
  laserOn: boolean
  /** 激光测距状态 */
  laserState: string
  /** 健康状况索引 (0 正常) */
  healthIndex: number
}

type ActionsType = {
  updateDeviceNo: (deviceNo: string) => void
  updateDeviceTypeName: (deviceTypeName: string) => void
  updateTaskCapability: (taskCapability: string) => void
  updateDeviceTaskCapability: (deviceId: string, value: string) => void
  updateSensorMode: (sensorMode: StateType['sensorMode']) => void
  updateLaserOn: (laserOn: boolean) => void
  updateLaserState: (laserState: string) => void
  updateHealthIndex: (healthIndex: number) => void
}

/** 固定翼演示（本地持久化）状态 */
const useFixedWingDemoStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        deviceNo: 'CY-9A-001',
        deviceTypeName: '固定翼',
        taskCapability: '察打一体',
        taskCapabilities: {},
        sensorMode: 'tv',
        workMode: '跟踪',
        laserOn: true,
        laserState: '单次测距',
        healthIndex: 0,
        updateDeviceNo: (deviceNo) => set({ deviceNo }, false, 'updateDeviceNo'),
        updateDeviceTypeName: (deviceTypeName) =>
          set({ deviceTypeName }, false, 'updateDeviceTypeName'),
        updateTaskCapability: (taskCapability) =>
          set({ taskCapability }, false, 'updateTaskCapability'),
        updateDeviceTaskCapability: (deviceId, value) =>
          set(
            (s) => ({
              taskCapabilities: { ...s.taskCapabilities, [deviceId]: value },
            }),
            false,
            'updateDeviceTaskCapability',
          ),
        updateSensorMode: (sensorMode) =>
          set({ sensorMode }, false, 'updateSensorMode'),
        updateLaserOn: (laserOn) => set({ laserOn }, false, 'updateLaserOn'),
        updateLaserState: (laserState) =>
          set({ laserState }, false, 'updateLaserState'),
        updateHealthIndex: (healthIndex) =>
          set({ healthIndex }, false, 'updateHealthIndex'),
      }),
      {
        name: 'fixed-wing-demo',
        storage: createJSONStorage(() => localStorage),
      },
    ),
    {
      name: 'fixed-wing-demo',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useFixedWingDemoStore
