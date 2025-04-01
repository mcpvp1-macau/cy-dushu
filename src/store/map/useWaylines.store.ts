import { create } from 'zustand'

export type Wayline = {
  id: string
  type: string
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
}

type ActionsType = {
  updateWaylines: (waylines: StateType['waylines']) => void
  updateSwarmPolygons: (swarmPolygons: StateType['swarmPolygons']) => void
}

const useWaylinesStore = create<StateType & ActionsType>()((set) => ({
  waylines: [],
  swarmPolygons: [],
  updateWaylines: (waylines) => set({ waylines }),
  updateSwarmPolygons: (swarmPolygons) => set({ swarmPolygons }),
}))

export default useWaylinesStore
