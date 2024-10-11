import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  newEvent: any
  newLog: any
  refreshTemporary: any
  radarTarget: any
  /** 设备实时属性 */
  deviceRealtimeProperties: Record<
    string,
    {
      deviceId: string
      deviceName: string
      deviceStatus: string
      properties: Record<string, any>
      [property: string]: any
    }
  >
  sleepStatus: Record<string, string>
  onlineStatus: Record<string, string>
}

type ActionsType = {
  updateNewEvent: (newEvent: StateType['newEvent']) => void
  updateNewLog: (newLog: StateType['newLog']) => void
  updateRefreshTemporary: (
    refreshTemporary: StateType['refreshTemporary'],
  ) => void
  /** 更新设备实时属性 */
  updateDeviceRealtimeProperties: (
    deviceRealtimeProperties: StateType['deviceRealtimeProperties'],
  ) => void
  updateRadarTarget: (radarTarget: StateType['radarTarget']) => void
  updateOnlineStatus: (onlineStatus: StateType['onlineStatus']) => void
}

const useGlobalWsStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      newEvent: null,
      newLog: null,
      refreshTemporary: null,
      sleepStatus: {},
      deviceRealtimeProperties: {},
      radarTarget: {},
      onlineStatus: {},
      updateNewEvent: (newEvent) => {
        set({ newEvent }, false, 'updateNewEvent')
      },
      updateNewLog: (newLog) => set({ newLog }, false, 'updateNewLog'),
      updateRefreshTemporary: (refreshTemporary) =>
        set({ refreshTemporary }, false, 'updateRefreshTemporary'),
      updateDeviceRealtimeProperties: (deviceRealtimeProperties) => {
        // 在线状态
        const onlineStatus: StateType['onlineStatus'] = {}
        for (const key in deviceRealtimeProperties) {
          onlineStatus[key] = deviceRealtimeProperties[key].deviceStatus
        }
        // 睡眠状态
        const sleepStatus: StateType['sleepStatus'] = {}
        for (const key in deviceRealtimeProperties) {
          sleepStatus[key] =
            deviceRealtimeProperties[key].properties.sleepStatus
        }
        set(
          { deviceRealtimeProperties, onlineStatus, sleepStatus },
          false,
          'updateDeviceRealtimeProperties',
        )
      },
      updateRadarTarget: (radarTarget) =>
        set({ radarTarget }, false, 'updateRadarTarget'),
      updateOnlineStatus: (onlineStatus) => {
        set({ onlineStatus }, false, 'updateOnlineStatus')
      },
    }),
    {
      name: 'global-websocket',
      enabled: import.meta.env.DEV,
    },
  ),
)

export const useRealOnlineStatus = (deviceId: string) => {
  return useGlobalWsStore((s) => s.onlineStatus[deviceId])
}

export const useRealTaskStatus = (deviceId: string) => {
  return useGlobalWsStore(
    (s) => s.deviceRealtimeProperties[deviceId]?.properties?.taskStatus,
  )
}

export default useGlobalWsStore
