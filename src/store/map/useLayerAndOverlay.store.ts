import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  layerList: API_LAYER_OVERLAY.domain.Layer[]
  overlayList: API_LAYER_OVERLAY.domain.Overlay[]
  activePOI: API_LAYER_OVERLAY.domain.POIRecord | null
}

type ActionsType = {
  updateLayerList: (layerList: StateType['layerList']) => void
  updateOverlayList: (overlayList: StateType['overlayList']) => void
  updateActivePOI: (activePOI: StateType['activePOI']) => void
}

const useMapLayerAndOverlayStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      layerList: [],
      overlayList: [],
      activePOI: null,
      updateLayerList: (layerList) => {
        set({ layerList }, false, 'updateLayerList')
      },
      updateOverlayList: (overlayList) => {
        set({ overlayList }, false, 'updateOverlayList')
      },
      updateActivePOI: (activePOI) => {
        set({ activePOI }, false, 'updateActivePOI')
      },
    }),
    {
      name: 'map-layer-overlay',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useMapLayerAndOverlayStore

type ConfigStateType = {
  hiddenOverlayIds: Set<number>
  activeSpaceIds: Set<string>
}

type ConfigActionsType = {
  updateHiddenOverlayIds: (
    hiddenOverlayIds: ConfigStateType['hiddenOverlayIds'],
  ) => void
  updateActiveSpaceIds: (
    activeSpaceIds: ConfigStateType['activeSpaceIds'],
  ) => void
}

const useMapLayerAndOverlayConfigStore = create<
  ConfigStateType & ConfigActionsType
>()(
  devtools(
    persist(
      (set) => ({
        hiddenOverlayIds: new Set(),
        activeSpaceIds: new Set(),
        updateHiddenOverlayIds: (hiddenOverlayIds) => {
          set({ hiddenOverlayIds }, false, 'updateHiddenOverlayIds')
        },
        updateActiveSpaceIds: (activeSpaceIds) => {
          set({ activeSpaceIds }, false, 'updateActiveSpaceIds')
        },
      }),
      {
        name: 'map-layer-overlay-config',
        storage: createJSONStorage(() => sessionStorage, {
          replacer: (key: string, value: any) => {
            if (key === 'hiddenOverlayIds' || key === 'activeSpaceIds') {
              return Array.from(value)
            }
            return value
          },
          reviver: (key: string, value: any) => {
            if (key === 'hiddenOverlayIds' || key === 'activeSpaceIds') {
              return new Set(value)
            }
            return value
          },
        }),
      },
    ),
    {
      name: 'map-layer-overlay-config',
      enabled: import.meta.env.DEV,
    },
  ),
)

export { useMapLayerAndOverlayConfigStore }
