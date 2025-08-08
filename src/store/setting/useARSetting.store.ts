import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
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
  aoi: {
    enable: boolean
    color: string
    borderColor: string
    borderSize: number
    showBuilding: boolean
  }
  poi: {
    enable: boolean
    showName: boolean
    filter: string[]
  }
  wayline: {
    enable: boolean
    color: string
  }
  overlay: {
    enable: boolean
    point: boolean
    area: boolean
  }
  flightArea: {
    enable: boolean
    filter: string[]
  }
  shift: Record<
    string,
    {
      gimbalYaw: number
      gimbalPitch: number
      height: number
      lng: number
      lat: number
    }
  >
}

type ActionsType = {
  updateAR: (data: StateType) => void
}

/** 虚实融合设置 */
const useARSettingStore = create<StateType & ActionsType>()(
  devtools(
    persist(
      (set) => ({
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
          size: 12,
          borderSize: 2,
        },
        aoi: {
          enable: true,
          color: '#5159A233',
          borderColor: '#000000',
          borderSize: 2,
          showBuilding: true,
        },
        shift: {},
        wayline: {
          enable: true,
          color: '#22c55e66',
        },
        poi: {
          enable: true,
          showName: true,
          filter: [],
        },
        overlay: {
          enable: true,
          point: true,
          area: true,
        },
        flightArea: {
          enable: true,
          filter: [],
        },
        updateAR: (data) => {
          set(data)
        },
      }),
      {
        name: 'ARSettingV4',
        storage: createJSONStorage(() => localStorage),
      },
    ),
    {
      name: 'ARSetting',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)
export default useARSettingStore
