import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StateType = {
  colorMap: Record<string, string>
  materialType: Record<string, 'color' | 'outline' | 'glow'>
  setColor: (deviceId: string, color: string) => void
  setMaterialType: (
    deviceId: string,
    materialType: 'color' | 'outline' | 'glow',
  ) => void
}

/** 设备轨迹颜色 */
const useDeviceTrackColorStore = create<StateType>()(
  persist(
    (set) => ({
      colorMap: {},
      materialType: {},
      setColor: (deviceId, color) =>
        set((state) => ({
          colorMap: {
            ...state.colorMap,
            [deviceId]: color,
          },
        })),
      setMaterialType: (deviceId, materialType) =>
        set((state) => ({
          materialType: {
            ...state.materialType,
            [deviceId]: materialType,
          },
        })),
    }),
    {
      name: 'device-track-settings',
      getStorage: () => localStorage,
    },
  ),
)

export default useDeviceTrackColorStore
