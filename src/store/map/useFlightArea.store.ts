import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  flightAreaGroupList: API_LAYER_OVERLAY.domain.Layer[]
  flightAreaList: API_LAYER_OVERLAY.domain.Overlay[]
}

type ActionsType = {
  updateFlightAreaGroupList: (
    flightAreaGroupList: StateType['flightAreaGroupList'],
  ) => void
  updateFlightAreaList: (flightAreaList: StateType['flightAreaList']) => void
}

const useFlightAreaStore = create<StateType & ActionsType>()(
  devtools(
    (set) => ({
      flightAreaGroupList: [],
      flightAreaList: [],
      updateFlightAreaGroupList: (flightAreaGroupList) => {
        set({ flightAreaGroupList }, false, 'updateFlightAreaGroupList')
      },
      updateFlightAreaList: (flightAreaList) => {
        set({ flightAreaList }, false, 'updateFlightAreaList')
      },
    }),
    {
      name: 'flight-area',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useFlightAreaStore
