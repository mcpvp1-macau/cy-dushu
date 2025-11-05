import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type StateType = {
  deviceCameraConfig: Record<
    string,
    {
      lng: number
      lat: number
      height: number
      heading: number
      pitch: number
      roll: number
      fov: number
      far: number
      aspectRatio: number
    }
  >
}

type ActionsType = {
  updateDevicesCameraConfig: (data: StateType['deviceCameraConfig']) => void
  updateDeviceCameraConfig: (
    deviceId: string,
    config: StateType['deviceCameraConfig'][string],
  ) => void
}

const useCameraSettingStore = create<StateType & ActionsType>()(
  persist(
    (set, get) => ({
      deviceCameraConfig: {},
      updateDeviceCameraConfig: (deviceId, config) =>
        set(() => ({
          deviceCameraConfig: {
            ...get().deviceCameraConfig,
            [deviceId]: config,
          },
        })),
      updateDevicesCameraConfig: (data) =>
        set(() => ({
          deviceCameraConfig: data,
        })),
    }),
    {
      name: 'camera-setting-store',
      version: 1,
    },
  ),
)

export default useCameraSettingStore
