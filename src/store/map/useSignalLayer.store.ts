import GeoQuickSearch from '@/utils/geo-quick-search'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type StateType = {
  enableSignalLayer: boolean
  range: [number, number]
  data: any[]
  levelData: Record<number, StateType['data']>
  levelGQS: Record<number, GeoQuickSearch>
  ceilMap: Record<string, string>
}

type ActionsType = {
  updateEnableSignalLayer: (enableSignalLayer: boolean) => void
  updateRange: (low: number, high: number) => void
  updateData: (data: any[]) => void
  updateLevelDataByLevel: (level: number, data: StateType['data']) => void
  updateLevelData: (data: StateType['levelData']) => void
  updateCeilMap: (data: StateType['ceilMap']) => void
  updateCeilMapAppend: (data: StateType['ceilMap']) => void
  updateLevelGQS: (levelGQS: Record<number, GeoQuickSearch>) => void
  updateLevelGQSByLevel: (level: number, gqs: GeoQuickSearch) => void
}

/** 电磁态势信号 */
const useWirelessSituationStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      enableSignalLayer: false,
      range: [200, 700],
      data: [],
      levelData: {},
      ceilMap: {},
      levelGQS: {},
      updateEnableSignalLayer: (enableSignalLayer) =>
        set({ enableSignalLayer }),
      updateRange: (low, high) => set({ range: [low, high] }),
      updateData: (data) => {
        set({ data }, false, 'updateData')
      },
      updateLevelDataByLevel: (level, data) => {
        set(
          (state) => {
            const levelData = { ...state.levelData, [level]: data }
            return { levelData }
          },
          false,
          'updateLevelDataByLevel',
        )
      },
      updateLevelData: (data) => set({ levelData: data }),
      updateCeilMap: (data) => set({ ceilMap: data }, false, 'updateCeilMap'),
      updateCeilMapAppend: (data) => {
        set(
          (state) => {
            const ceilMap = { ...state.ceilMap, ...data }
            return { ceilMap }
          },
          false,
          'updateCeilMapAppend',
        )
      },
      updateLevelGQS: (levelGQS) => {
        set({ levelGQS }, false, 'updateLevelGQS')
      },
      updateLevelGQSByLevel: (level, gqs) => {
        set(
          (state) => {
            const levelGQS = { ...state.levelGQS, [level]: gqs }
            return { levelGQS }
          },
          false,
          'updateLevelGQSByLevel',
        )
      },
    }),
    {
      name: 'signal-layer-store',
      enabled: process.env.NODE_ENV === 'development' && false,
    },
  ),
)

export default useWirelessSituationStore
