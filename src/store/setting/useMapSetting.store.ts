import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  resolution: string
  webgl1: boolean
  uavDetailFrustum: boolean
}

type ActionsType = {
  updateResolution: (data: string) => void
  updateWebgl1: (data: boolean) => void
  updateUavDetailFrustum: (data: boolean) => void
}

const useMapSettingStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        resolution: '2',
        webgl1: false,
        uavDetailFrustum: false,
        updateResolution: (data) => {
          set(
            {
              resolution: data,
            },
            false,
          )
        },
        updateWebgl1: (data) => {
          set({ webgl1: data }, false)
        },
        updateUavDetailFrustum: (data) => {
          set({ uavDetailFrustum: data }, false)
        },
      }),
      {
        name: 'map-setting',
        storage: createJSONStorage(() => localStorage),
      },
    ),
    {
      name: 'map-setting',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)
export default useMapSettingStore
