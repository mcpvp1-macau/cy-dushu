import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StateType = {
  trackOpen: Record<string, boolean>
  setTrackOpen: (deviceId: string, open: boolean) => void
}

/** 设备轨迹颜色 */
const useDeviceInactiveStore = create<StateType>()(
  persist(
    (set) => ({
      trackOpen: {},
      setTrackOpen: (deviceId, open) =>
        set((state) => ({
          trackOpen: {
            ...state.trackOpen,
            [deviceId]: open,
          },
        })),
    }),
    {
      name: 'device-inactive-settings',
      getStorage: () => localStorage,
    },
  ),
)

export default useDeviceInactiveStore
