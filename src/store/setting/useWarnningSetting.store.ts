import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  isAddMap: boolean
  isHaveAvdio: boolean
  isHaveLight: boolean
}

type ActionsType = {
  updateIsAddMap: (data: boolean) => void
  updateIsHaveAvdio: (data: boolean) => void
  updateIsHaveLight: (data: boolean) => void
}

const useWarnningSettingStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        isAddMap: true,
        isHaveAvdio: true,
        isHaveLight: true,
        updateIsAddMap: (data) => {
          set(
            {
              isAddMap: data,
            },
            false,
          )
        },
        updateIsHaveAvdio: (data) => {
          set(
            {
              isHaveAvdio: data,
            },
            false,
          )
        },
        updateIsHaveLight: (data) => {
          set(
            {
              isHaveLight: data,
            },
            false,
          )
        },
      }),
      {
        name: 'warnning-setting',
        storage: createJSONStorage(() => localStorage),
      },
    ),
    {
      name: 'warnning-setting',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)
export default useWarnningSettingStore
