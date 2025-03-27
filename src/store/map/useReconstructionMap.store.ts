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
  hiddenGroupIds: Set<number>
  hiddenLayerIds: Set<number>
  activeLayerIds: Set<string>
}

type ConfigActionsType = {
  updateHiddenGroupIds: (
    hiddenGroupIds: ConfigStateType['hiddenGroupIds'],
  ) => void
  updateHiddenLayerIds: (
    hiddenLayerIds: ConfigStateType['hiddenLayerIds'],
  ) => void
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
        hiddenGroupIds: new Set(),
        hiddenLayerIds: new Set(),
        activeLayerIds: new Set(),
        updateHiddenGroupIds: (hiddenGroupIds) => {
          set({ hiddenGroupIds }, false, 'updateHiddenGroupIds')
        },
        updateHiddenLayerIds: (hiddenLayerIds) => {
          set({ hiddenLayerIds }, false, 'updateHiddenLayerIds')
        },
        updateActiveLayerIds: (activeLayerIds) => {
          set({ activeLayerIds }, false, 'updateActiveLayerIds')
        },
      }),
      {
        name: 'reconstruction-map-config',
        storage: createJSONStorage(() => sessionStorage, {
          replacer: (key: string, value: any) => {
            if (
              key === 'hiddenGroupIds' ||
              key === 'hiddenLayerIds' ||
              key === 'activeLayerIds'
            ) {
              return Array.from(value)
            }
            return value
          },
          reviver: (key: string, value: any) => {
            if (
              key === 'hiddenGroupIds' ||
              key === 'hiddenLayerIds' ||
              key === 'activeLayerIds'
            ) {
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
