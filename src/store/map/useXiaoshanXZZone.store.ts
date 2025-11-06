import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  hiddenZones: Set<number>
}

type ActionsType = {
  updateHiddenZones: (hiddenZones: StateType['hiddenZones']) => void
}

const useXiaoshanXZZoneStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        hiddenZones: new Set(),
        updateHiddenZones: (hiddenZones) => {
          set({ hiddenZones }, false, 'updateHiddenZones')
        },
      }),
      {
        name: 'shanghai-war-zone-config',
        storage: createJSONStorage(() => localStorage, {
          replacer: (key: string, value: any) => {
            if (key === 'hiddenZones') {
              return Array.from(value)
            }
            return value
          },
          reviver: (key: string, value: any) => {
            if (key === 'hiddenZones') {
              return new Set(value)
            }
            return value
          },
        }),
      },
    ),
    {
      name: 'shanghai-war-zone-config',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useXiaoshanXZZoneStore
