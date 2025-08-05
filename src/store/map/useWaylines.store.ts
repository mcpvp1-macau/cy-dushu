import { create } from 'zustand'

export type Wayline = {
  id: string
  type: string
  executeDeviceId?: string
  points: { pointX: number; pointY: number; pointZ: number }[]
  taskBasic: Record<string, any>
}

export type SwarmPolygon = {
  id: string
  points: number[][]
}

type StateType = {
  waylines: Wayline[]
  swarmPolygons: SwarmPolygon[]
  previewedWayline: Wayline | null
}

type ActionsType = {
  updateWaylines: (waylines: StateType['waylines']) => void
  updateSwarmPolygons: (swarmPolygons: StateType['swarmPolygons']) => void
  setPreviewedWayline: (wayline: Wayline | null) => void
}

const useWaylinesStore = create<StateType & ActionsType>()((set) => ({
  waylines: [],
  swarmPolygons: [],
  previewedWayline: null,
  updateWaylines: (waylines) => set({ waylines }),
  updateSwarmPolygons: (swarmPolygons) => set({ swarmPolygons }),
  setPreviewedWayline: (wayline) => set({ previewedWayline: wayline }),
}))

export default useWaylinesStore
