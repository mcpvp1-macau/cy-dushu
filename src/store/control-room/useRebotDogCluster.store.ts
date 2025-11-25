import { create } from 'zustand'
import { Btn } from '@/pages/control-room/rebot-dog/components/ControlButtons/type'
import type { RebotDogControlRoomStoreType } from '@/store/context-store/useRebotDogControlRoom.store'

export type ClusterRobotDog = {
  deviceId: string
  productKey: string
  deviceName: string
  videoId?: string
}

type ClusterState = {
  dogs: ClusterRobotDog[]
  /** 当前选中的设备，用于批量控制 */
  selectedIds: string[]
  /** 设备最新状态 */
  dogStates: Record<string, API_DEVICE.domain.Properties | undefined>
  /** 对应的单机控制 store，用于发送命令 */
  stores: Record<string, RebotDogControlRoomStoreType | undefined>
  params: {
    speed: number
    attitude: number
  }
  dogControlInfo: Partial<{
    xSpeed: number
    ySpeed: number
    yawSpeed: number
    yaw: number
    pitch: number
    roll: number
  }>
  activeMouseBtn: Btn | null
}

type ClusterActions = {
  addDog: (
    dog: ClusterRobotDog,
    initState?: API_DEVICE.domain.Properties,
  ) => void
  removeDog: (deviceId: string) => void
  updateDogState: (
    deviceId: string,
    state: API_DEVICE.domain.Properties,
  ) => void
  registerStore: (deviceId: string, store: RebotDogControlRoomStoreType) => void
  unregisterStore: (deviceId: string) => void
  toggleSelect: (deviceId: string) => void
  selectOnly: (deviceId: string) => void
  clearSelection: () => void
  updateDogControlInfo: (dogControlInfo: ClusterState['dogControlInfo']) => void
  updateActiveMouseBtn: (btn: Btn | null) => void
  updateParams: (params: ClusterState['params']) => void
  broadcastCommand: (method: string, value: any) => void
}

const readNumber = (key: string, fallback: number) => {
  const raw = localStorage?.getItem(key)
  const val = Number(raw)
  return Number.isFinite(val) ? val : fallback
}

export const useRebotDogClusterStore = create<ClusterState & ClusterActions>(
  (set, get) => ({
    dogs: [],
    selectedIds: [],
    dogStates: {},
    stores: {},
    params: {
      speed: readNumber('RebotDogSpeed', 0.5),
      attitude: readNumber('RebotDogAttitude', 0.5),
    },
    dogControlInfo: {
      xSpeed: 0,
      ySpeed: 0,
      yawSpeed: 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
    },
    activeMouseBtn: null,
    addDog: (dog, initState) =>
      set((s) => {
        if (s.dogs.some((d) => d.deviceId === dog.deviceId)) {
          return s
        }
        return {
          ...s,
          dogs: [...s.dogs, dog],
          selectedIds: [...s.selectedIds, dog.deviceId],
          dogStates: initState
            ? { ...s.dogStates, [dog.deviceId]: initState }
            : s.dogStates,
        }
      }),
    removeDog: (deviceId) =>
      set((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [deviceId]: _state, ...restState } = s.dogStates
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [deviceId]: _store, ...restStores } = s.stores
        return {
          ...s,
          dogs: s.dogs.filter((d) => d.deviceId !== deviceId),
          selectedIds: s.selectedIds.filter((id) => id !== deviceId),
          dogStates: restState,
          stores: restStores,
        }
      }),
    updateDogState: (deviceId, state) =>
      set((s) => ({
        ...s,
        dogStates: {
          ...s.dogStates,
          [deviceId]: { ...s.dogStates[deviceId], ...state },
        },
      })),
    registerStore: (deviceId, store) =>
      set((s) => ({
        ...s,
        stores: { ...s.stores, [deviceId]: store },
      })),
    unregisterStore: (deviceId) =>
      set((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [deviceId]: _store, ...restStores } = s.stores
        return { ...s, stores: restStores }
      }),
    toggleSelect: (deviceId) =>
      set((s) => {
        const selected = new Set(s.selectedIds)
        if (selected.has(deviceId)) {
          selected.delete(deviceId)
        } else {
          selected.add(deviceId)
        }
        return { ...s, selectedIds: Array.from(selected) }
      }),
    selectOnly: (deviceId) => set((s) => ({ ...s, selectedIds: [deviceId] })),
    clearSelection: () => set((s) => ({ ...s, selectedIds: [] })),
    updateDogControlInfo: (dogControlInfo) => set({ dogControlInfo }),
    updateActiveMouseBtn: (btn) => set({ activeMouseBtn: btn }),
    updateParams: (params) => {
      set({ params })
      localStorage?.setItem('RebotDogSpeed', params.speed.toString())
      localStorage?.setItem('RebotDogAttitude', params.attitude.toString())
    },
    broadcastCommand: (method, value) => {
      if (!value) {
        return
      }
      const { selectedIds, stores } = get()
      selectedIds.forEach((id) => {
        const store = stores[id]
        store?.getState().sendCommand(method, value)
      })
    },
  }),
)
