import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  /** 当前设备类型 */
  activeDeviceType: string
  /** 是否在线 */
  isOnline: boolean
  /** 是否任务设备 */
  isTask: boolean
  /** 是否非任务设备 */
  isNotTask: boolean
}

type ActionType = {
  setActiveDeviceType: (value: string) => void
  setDeviceStatus: (payload: {
    isOnline?: boolean
    isTask?: boolean
    isNotTask?: boolean
  }) => void
}

/** 设备列表配置 */
const useDeviceListConfigStore = create<StateType & ActionType>()(
  devtools(
    (set) => ({
      activeDeviceType: 'all',
      isOnline: false,
      isTask: false,
      isNotTask: false,
      setActiveDeviceType: (v) => {
        set({ activeDeviceType: v }, false, 'setActiveDeviceType')
      },
      setDeviceStatus: (payload) => {
        set(payload, false, 'setDeviceStatus')
      },
    }),
    {
      name: 'device-list-config',
      enabled: import.meta.env.DEV && false,
    },
  ),
)

export default useDeviceListConfigStore
