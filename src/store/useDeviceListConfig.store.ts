import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  /** 当前设备类型 */
  activeDeviceType: string
  /** 是否在线 */
  isOnline: boolean
  /** 是否任务设备 */
  isTask: boolean
  /** 是否非任务设备 */
  isNotTask: boolean
  /** 隐藏的设备 */
  hiddenDeviceIds: Record<string, boolean>
  /** 隐藏的分组 */
  hiddenGroupIds: Record<string, boolean>
}

type ActionType = {
  setActiveDeviceType: (value: string) => void
  setDeviceStatus: (payload: {
    isOnline?: boolean
    isTask?: boolean
    isNotTask?: boolean
  }) => void
  updateHiddenDeviceIds: (ids: StateType['hiddenDeviceIds']) => void
  updateHiddenGroupIds: (ids: StateType['hiddenGroupIds']) => void
}

/** 设备列表配置 */
const useDeviceListConfigStore = create<StateType & ActionType>()(
  devtools(
    persist(
      (set) => ({
        activeDeviceType: 'all',
        isOnline: false,
        isTask: false,
        isNotTask: false,
        hiddenDeviceIds: {},
        hiddenGroupIds: {},
        setActiveDeviceType: (v) => {
          set({ activeDeviceType: v }, false, 'setActiveDeviceType')
        },
        setDeviceStatus: (payload) => {
          set(payload, false, 'setDeviceStatus')
        },
        updateHiddenDeviceIds: (ids) => {
          set({ hiddenDeviceIds: ids }, false, 'updateHiddenDeviceIds')
        },
        updateHiddenGroupIds: (ids) => {
          set({ hiddenGroupIds: ids }, false, 'updateHiddenGroupIds')
        },
      }),
      {
        name: 'device-list-config',
        storage: createJSONStorage(() => localStorage),
      },
    ),
    {
      name: 'device-list-config',
      enabled: import.meta.env.DEV && false,
    },
  ),
)

export default useDeviceListConfigStore
