import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

type StateType = {
  flightAreaGroupList: API_FLIGHT_AREA.domain.FlightAreaGroup[]
  flightAreaList: API_FLIGHT_AREA.domain.FlightArea[]
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

const useFlightAreaConfigStore = create<ConfigStateType & ConfigActionsType>()(
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
        name: 'flight-area-config',
        storage: createJSONStorage(() => sessionStorage, {
          replacer: (key: string, value: any) => {
            if (key === 'hiddenOverlayIds' || key === 'activeSpaceIds') {
              return Array.from(value)
            }
            if (key === 'layerList') {
              return []
            }
            if (key === 'overlayList') {
              return []
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
      name: 'flight-area-config',
      enabled: import.meta.env.DEV,
    },
  ),
)

export default useFlightAreaStore
export { useFlightAreaConfigStore }
