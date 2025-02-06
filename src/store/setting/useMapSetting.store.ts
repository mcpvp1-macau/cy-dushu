import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  resolution: string
}

type ActionsType = {
  updateResolution: (data: string) => void
}

const useMapSettingStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        resolution: '2',
        updateResolution: (data) => {
          set(
            {
              resolution: data,
            },
            false,
          )
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
