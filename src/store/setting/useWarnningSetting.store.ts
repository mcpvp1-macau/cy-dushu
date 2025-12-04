import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  isAddMap: boolean
  isHaveAvdio: boolean
  isHaveLight: boolean
  isAllowEventNotification: boolean
  isAllowAlarmNotification: boolean
}

type ActionsType = {
  updateIsAddMap: (data: boolean) => void
  updateIsHaveAvdio: (data: boolean) => void
  updateIsHaveLight: (data: boolean) => void
  updateIsAllowEventNotification: (data: boolean) => void
  updateIsAllowAlarmNotification: (data: boolean) => void
}

const useWarnningSettingStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        isAddMap: true,
        isHaveAvdio: true,
        isHaveLight: true,
        isAllowEventNotification: true,
        isAllowAlarmNotification: true,
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
        updateIsAllowEventNotification: (data) => {
          set(
            {
              isAllowEventNotification: data,
            },
            false,
          )
        },
        updateIsAllowAlarmNotification: (data) => {
          set(
            {
              isAllowAlarmNotification: data,
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
