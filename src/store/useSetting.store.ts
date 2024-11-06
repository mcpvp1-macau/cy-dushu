import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  virtualReal: {
    /** 主路 */
    mainRoad: {
      enable: boolean
      color: string
      borderColor: string
      size: number
      borderSize: number
    }
    /** 小路 */
    subRoad: {
      enable: boolean
      color: string
      borderColor: string
      size: number
      borderSize: number
    }
    /** 文本 */
    text: {
      enable: boolean
      color: string
      borderColor: string
      size: number
      borderSize: number
    }
    /** 建筑 */
    building: {
      enable: boolean
      color: string
      borderColor: string
      borderSize: number
    }
    shift: {
      gimbalYaw: number
      gimbalPitch: number
      height: number
      lng: number
      lat: number
    }
  }
}

type ActionsType = {
  updateVirtualReal: (data: StateType['virtualReal']) => void
}

const useSettingStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
        virtualReal: {
          mainRoad: {
            enable: true,
            color: '#176932',
            borderColor: '#000000',
            size: 4,
            borderSize: 2,
          },
          subRoad: {
            enable: true,
            color: '#FFB366',
            borderColor: '#000000',
            size: 2,
            borderSize: 1,
          },
          text: {
            enable: true,
            color: '#ffffff',
            borderColor: '#000000',
            size: 20,
            borderSize: 2,
          },
          building: {
            enable: true,
            color: '#5159A233',
            borderColor: '#000000',
            borderSize: 2,
          },
          shift: {
            gimbalYaw: 0,
            gimbalPitch: 0,
            height: 0,
            lng: 0,
            lat: 0,
          },
        },
        updateVirtualReal: (data) => {
          set({
            virtualReal: data,
          })
        },
      }),
      {
        name: 'user-setting',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
    {
      name: 'user-setting',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)
export default useSettingStore
