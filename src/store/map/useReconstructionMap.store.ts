import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  layerGroupList: API_RECONSTRUCTION.LayerGroup[]
  layerList: API_RECONSTRUCTION.Layer[]
}

type ActionsType = {
  updateLayerGroupList: (data: StateType['layerGroupList']) => void
  updateLayerList: (data: StateType['layerList']) => void
}

const useReconstructionMapStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      layerGroupList: [],
      layerList: [],
      updateLayerGroupList: (data) => {
        set({ layerGroupList: data }, false, 'updateLayerGroupList')
      },
      updateLayerList: (data) => {
        set({ layerList: data }, false, 'updateLayerList')
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
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useReconstructionMapStore
export { useReconstructionMapConfigStore }
