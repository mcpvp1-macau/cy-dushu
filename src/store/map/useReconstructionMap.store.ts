import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { getLayerList } from '@/service/modules/reconstruction'
import mitt, { type Emitter, EventType } from 'mitt'

export const reconstructionMitt: Emitter<Record<EventType, number>> = mitt()

type StateType = {
  layerGroupList: API_RECONSTRUCTION.LayerGroup[]
  layerList: API_RECONSTRUCTION.Layer[]
}

type ActionsType = {
  updateLayerGroupList: (data: StateType['layerGroupList']) => void
  updateLayerList: (data: StateType['layerList']) => void
  requestAndUpdateLayerList: () => void
}

const useReconstructionMapStore = create<StateType & ActionsType>()(
  devtools(
    (set, get) => ({
      layerGroupList: [],
      layerList: [],
      updateLayerGroupList: (data) => {
        set({ layerGroupList: data }, false, 'updateLayerGroupList')
      },
      updateLayerList: (data) => {
        set({ layerList: data }, false, 'updateLayerList')
      },
      requestAndUpdateLayerList: () => {
        getLayerList({
          layerIds: get().layerGroupList.map((group) => group.id),
        }).then((data) => {
          set({ layerList: data.data }, false, 'updateLayerList')
        })
      },
    }),
    {
      name: 'reconstruction-map',
      enabled: import.meta.env.DEV,
    },
  ),
)

type ConfigStateType = {
  showLayerIds: Set<number>
  activeLayerIds: Set<string>
}

type ConfigActionsType = {
  updateShowLayerIds: (hiddenLayerIds: ConfigStateType['showLayerIds']) => void
  updateActiveLayerIds: (
    activeLayerIds: ConfigStateType['activeLayerIds'],
  ) => void
}

const useReconstructionMapConfigStore = create<
  ConfigStateType & ConfigActionsType
>()(
  devtools(
    persist(
      (set) => ({
        showLayerIds: new Set(),
        activeLayerIds: new Set(),
        updateShowLayerIds: (showLayerIds) => {
          set({ showLayerIds }, false, 'updateShowLayerIds')
        },
        updateActiveLayerIds: (activeLayerIds) => {
          set({ activeLayerIds }, false, 'updateActiveLayerIds')
        },
      }),
      {
        name: 'reconstruction-map-config',
        storage: createJSONStorage(() => localStorage, {
          replacer: (key: string, value: any) => {
            if (key === 'showLayerIds' || key === 'activeLayerIds') {
              return Array.from(value)
            }
            if (key === 'layerList') {
              return []
            }
            if (key === 'layerGroupList') {
              return []
            }
            return value
          },
          reviver: (key: string, value: any) => {
            if (key === 'showLayerIds' || key === 'activeLayerIds') {
              return new Set(value)
            }
            return value
          },
        }),
      },
    ),
    {
      name: 'reconstruction-map-config',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useReconstructionMapStore
export { useReconstructionMapConfigStore }
