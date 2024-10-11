import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

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
